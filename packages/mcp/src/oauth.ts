/**
 * OAuth 2.1 endpoints for Claude Desktop integration
 *
 * Implements OAuth 2.1 with PKCE as specified in the MCP authorization spec.
 * Uses stateless encrypted tokens — no server-side storage required.
 *
 * Spec: https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization
 *
 * Flow:
 * 1. Claude redirects user to /authorize with OAuth params (including PKCE)
 * 2. User enters their Forge API token in a login form
 * 3. Server encrypts the token + PKCE challenge into an authorization code
 * 4. Redirects back to Claude with the code
 * 5. Claude exchanges code for access token via /token (with code_verifier)
 * 6. Server validates PKCE and returns base64-encoded access token
 */

import {
  defineEventHandler,
  getQuery,
  getRequestHeader,
  readBody,
  sendRedirect,
  setResponseHeader,
  setResponseStatus,
  type H3Event,
} from "h3";
import { createHash } from "node:crypto";

import { createAuthCode, decodeAuthCode } from "./crypto.ts";

/**
 * Create a base64-encoded access token from a Forge API token.
 * The access token is simply base64(apiToken) so that parseAuthHeader
 * can decode it on every request without any server-side lookup.
 */
export function createAccessToken(apiToken: string): string {
  return Buffer.from(apiToken).toString("base64");
}

/**
 * OAuth metadata for discovery (RFC 8414)
 * GET /.well-known/oauth-authorization-server
 *
 * MCP clients MUST check this endpoint first for server capabilities.
 */
export const oauthMetadataHandler = defineEventHandler((event: H3Event) => {
  const host = getRequestHeader(event, "host") || "localhost:3000";
  const protocol = getRequestHeader(event, "x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  setResponseHeader(event, "Content-Type", "application/json");
  setResponseHeader(event, "Cache-Control", "public, max-age=3600");

  return {
    // Required fields per RFC 8414
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/authorize`,
    token_endpoint: `${baseUrl}/token`,
    response_types_supported: ["code"],

    // OAuth 2.1 / MCP requirements
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"], // Public client

    // Optional but useful
    registration_endpoint: `${baseUrl}/register`,
    scopes_supported: ["forge"],
    service_documentation: "https://github.com/studiometa/forge-tools",
  };
});

/**
 * Protected resource metadata (RFC 9728)
 * GET /.well-known/oauth-protected-resource
 *
 * Tells MCP clients where to find the OAuth authorization server.
 */
export const protectedResourceHandler = defineEventHandler((event: H3Event) => {
  const host = getRequestHeader(event, "host") || "localhost:3000";
  const protocol = getRequestHeader(event, "x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  setResponseHeader(event, "Content-Type", "application/json");
  setResponseHeader(event, "Cache-Control", "public, max-age=3600");

  return {
    resource: `${baseUrl}/mcp`,
    authorization_servers: [baseUrl],
    bearer_methods_supported: ["header"],
    scopes_supported: ["forge"],
  };
});

/**
 * Dynamic Client Registration endpoint (RFC 7591)
 * POST /register
 *
 * MCP servers SHOULD support DCR to allow clients to register automatically.
 * Since we use stateless tokens, we accept any registration and return
 * a generated client_id.
 */
export const registerHandler = defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, "Content-Type", "application/json");

  let body: Record<string, unknown>;
  try {
    body = (await readBody(event)) as Record<string, unknown>;
  } catch {
    setResponseStatus(event, 400);
    return {
      error: "invalid_request",
      error_description: "Invalid JSON body",
    };
  }

  // Extract client metadata
  const clientName = (body.client_name as string) || "MCP Client";
  const redirectUris = (body.redirect_uris as string[]) || [];

  // Generate a client_id based on the registration
  // Since we're stateless, we encode minimal info in the client_id
  const clientId = Buffer.from(
    JSON.stringify({
      name: clientName,
      ts: Date.now(),
    }),
  ).toString("base64url");

  setResponseStatus(event, 201);
  return {
    client_id: clientId,
    client_name: clientName,
    redirect_uris: redirectUris,
    token_endpoint_auth_method: "none",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
  };
});

/**
 * Authorization endpoint — shows login form
 * GET /authorize
 */
export const authorizeGetHandler = defineEventHandler((event: H3Event) => {
  const query = getQuery(event);

  // Extract OAuth parameters
  const redirectUri = query.redirect_uri as string;
  const state = query.state as string;
  const codeChallenge = query.code_challenge as string;
  const codeChallengeMethod = query.code_challenge_method as string;

  // Validate required parameters per OAuth 2.1
  if (!redirectUri) {
    setResponseHeader(event, "Content-Type", "text/html; charset=utf-8");
    setResponseStatus(event, 400);
    return renderErrorPage("Missing required parameter: redirect_uri");
  }

  // PKCE is REQUIRED for public clients per MCP spec
  if (!codeChallenge) {
    const errorUrl = new URL(redirectUri);
    errorUrl.searchParams.set("error", "invalid_request");
    errorUrl.searchParams.set("error_description", "code_challenge is required");
    if (state) errorUrl.searchParams.set("state", state);
    return sendRedirect(event, errorUrl.toString(), 302);
  }

  if (codeChallengeMethod && codeChallengeMethod !== "S256") {
    const errorUrl = new URL(redirectUri);
    errorUrl.searchParams.set("error", "invalid_request");
    errorUrl.searchParams.set("error_description", "Only S256 code_challenge_method is supported");
    if (state) errorUrl.searchParams.set("state", state);
    return sendRedirect(event, errorUrl.toString(), 302);
  }

  setResponseHeader(event, "Content-Type", "text/html; charset=utf-8");

  return renderLoginForm({
    redirectUri,
    state,
    codeChallenge,
    codeChallengeMethod: codeChallengeMethod || "S256",
  });
});

/**
 * Authorization endpoint — process login
 * POST /authorize
 */
export const authorizePostHandler = defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as Record<string, string>;

  const { apiToken, redirectUri, state, codeChallenge, codeChallengeMethod } = body;

  // Validate redirect URI first (security requirement)
  if (!redirectUri) {
    setResponseHeader(event, "Content-Type", "text/html; charset=utf-8");
    setResponseStatus(event, 400);
    return renderErrorPage("Missing redirect_uri parameter");
  }

  // Validate redirect URI format (must be HTTPS or localhost)
  try {
    const uri = new URL(redirectUri);
    const isLocalhost = uri.hostname === "localhost" || uri.hostname === "127.0.0.1";
    const isHttps = uri.protocol === "https:";
    if (!isLocalhost && !isHttps) {
      setResponseStatus(event, 400);
      return renderErrorPage("redirect_uri must be HTTPS or localhost");
    }
  } catch {
    setResponseStatus(event, 400);
    return renderErrorPage("Invalid redirect_uri format");
  }

  // Validate required credentials
  if (!apiToken) {
    setResponseHeader(event, "Content-Type", "text/html; charset=utf-8");
    return renderLoginForm({
      redirectUri,
      state,
      codeChallenge,
      codeChallengeMethod,
      error: "Forge API Token is required",
    });
  }

  // Create encrypted authorization code with PKCE challenge
  const code = createAuthCode({
    apiToken,
    codeChallenge,
    codeChallengeMethod: codeChallengeMethod || "S256",
  });

  // Build redirect URL with authorization code
  const redirectUrl = new URL(redirectUri);
  redirectUrl.searchParams.set("code", code);
  if (state) {
    redirectUrl.searchParams.set("state", state);
  }

  // Show success page with auto-redirect
  setResponseHeader(event, "Content-Type", "text/html; charset=utf-8");
  return renderSuccessPage(redirectUrl.toString());
});

/**
 * Token endpoint — exchange code for access token
 * POST /token
 *
 * Supports:
 * - authorization_code grant (with PKCE validation)
 * - refresh_token grant
 */
export const tokenHandler = defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, "Content-Type", "application/json");

  let body: Record<string, string>;
  const contentType = getRequestHeader(event, "content-type") || "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const rawBody = await readBody(event);
    /* v8 ignore next 3 -- h3 pre-parses urlencoded bodies into objects */
    if (typeof rawBody === "string") {
      body = Object.fromEntries(new URLSearchParams(rawBody));
    } else {
      body = rawBody as Record<string, string>;
    }
  } else {
    body = (await readBody(event)) as Record<string, string>;
  }

  const { grant_type, code, code_verifier, refresh_token } = body;

  // Handle refresh token grant
  if (grant_type === "refresh_token") {
    return handleRefreshToken(event, refresh_token);
  }

  // Validate authorization code grant
  if (grant_type !== "authorization_code") {
    setResponseStatus(event, 400);
    return {
      error: "unsupported_grant_type",
      error_description: "Supported grant types: authorization_code, refresh_token",
    };
  }

  if (!code) {
    setResponseStatus(event, 400);
    return {
      error: "invalid_request",
      error_description: "Missing authorization code",
    };
  }

  if (!code_verifier) {
    setResponseStatus(event, 400);
    return {
      error: "invalid_request",
      error_description: "Missing code_verifier (PKCE required)",
    };
  }

  try {
    // Decode the authorization code
    const payload = decodeAuthCode(code);

    // Validate PKCE: SHA256(code_verifier) must equal code_challenge
    if (payload.codeChallenge) {
      const expectedChallenge = createS256Challenge(code_verifier);
      if (expectedChallenge !== payload.codeChallenge) {
        setResponseStatus(event, 400);
        return {
          error: "invalid_grant",
          error_description: "Invalid code_verifier",
        };
      }
    }

    // Create access token: base64(apiToken) — decodable on every request
    const accessToken = createAccessToken(payload.apiToken);

    // Create refresh token (encrypted credentials, longer expiry)
    const refreshToken = createAuthCode(
      { apiToken: payload.apiToken },
      86400 * 30, // 30 days
    );

    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600, // 1 hour
      refresh_token: refreshToken,
    };
  } catch (error) {
    setResponseStatus(event, 400);
    return {
      error: "invalid_grant",
      error_description: error instanceof Error ? error.message : "Invalid authorization code",
    };
  }
});

/**
 * Handle refresh token grant
 */
function handleRefreshToken(event: H3Event, refreshToken: string | undefined) {
  if (!refreshToken) {
    setResponseStatus(event, 400);
    return {
      error: "invalid_request",
      error_description: "Missing refresh_token",
    };
  }

  try {
    // Decode refresh token (it's just an encrypted auth code with longer expiry)
    const payload = decodeAuthCode(refreshToken);

    // Create new access token
    const accessToken = createAccessToken(payload.apiToken);

    // Create new refresh token (rotate for security)
    const newRefreshToken = createAuthCode(
      { apiToken: payload.apiToken },
      86400 * 30, // 30 days
    );

    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: newRefreshToken,
    };
  } catch (error) {
    setResponseStatus(event, 400);
    return {
      error: "invalid_grant",
      error_description: error instanceof Error ? error.message : "Invalid refresh token",
    };
  }
}

/**
 * Create S256 PKCE challenge from verifier
 * SHA256(code_verifier) encoded as base64url
 */
export function createS256Challenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Render the login form HTML
 */
function renderLoginForm(params: {
  redirectUri?: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  error?: string;
}): string {
  const { redirectUri, state, codeChallenge, codeChallengeMethod, error } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connect to Laravel Forge</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #18b69b 0%, #0e7460 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      width: 100%;
      max-width: 420px;
    }
    .logo {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo svg { width: 48px; height: 48px; }
    h1 {
      text-align: center;
      color: #1a1a2e;
      font-size: 24px;
      margin-bottom: 8px;
    }
    .subtitle {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-bottom: 32px;
    }
    .error {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 14px;
    }
    .notice {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 13px;
      line-height: 1.4;
    }
    .form-group { margin-bottom: 20px; }
    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #18b69b;
      box-shadow: 0 0 0 3px rgba(24, 182, 155, 0.2);
    }
    input::placeholder { color: #9ca3af; }
    .help-text {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    .help-text a { color: #18b69b; text-decoration: none; }
    .help-text a:hover { text-decoration: underline; }
    button {
      width: 100%;
      padding: 14px 24px;
      background: linear-gradient(135deg, #18b69b 0%, #0e7460 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(24, 182, 155, 0.4);
    }
    button:active { transform: translateY(0); }
    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: #9ca3af;
    }
    .footer a { color: #18b69b; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#18b69b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="#0e7460" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="#18b69b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1>Connect to Laravel Forge</h1>
    <p class="subtitle">Enter your Forge API token to connect with Claude</p>

    ${error ? `<div class="error">${escapeHtml(error)}</div>` : ""}

    <div class="notice">
      <strong>Your token is not stored on this server.</strong> It is encrypted into the authorization code and sent back to Claude Desktop, which holds it in its own secure storage.
    </div>

    <form method="POST" action="/authorize">
      <input type="hidden" name="redirectUri" value="${escapeHtml(redirectUri || "")}">
      <input type="hidden" name="state" value="${escapeHtml(state || "")}">
      <input type="hidden" name="codeChallenge" value="${escapeHtml(codeChallenge || "")}">
      <input type="hidden" name="codeChallengeMethod" value="${escapeHtml(codeChallengeMethod || "S256")}">

      <div class="form-group">
        <label for="apiToken">Forge API Token *</label>
        <input type="password" id="apiToken" name="apiToken" required placeholder="Enter your Forge API token">
        <p class="help-text">
          Generate at <a href="https://forge.laravel.com/user-profile/api" target="_blank" rel="noopener">forge.laravel.com → API Tokens</a>
        </p>
      </div>

      <button type="submit">Connect to Forge</button>
    </form>

    <p class="footer">
      Powered by <a href="https://github.com/studiometa/forge-tools" target="_blank" rel="noopener">forge-tools</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * Render success page with auto-redirect
 */
function renderSuccessPage(redirectUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="2;url=${escapeHtml(redirectUrl)}">
  <title>Connected — Forge MCP</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #18b69b 0%, #0e7460 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      width: 100%;
      max-width: 420px;
      text-align: center;
    }
    .success-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .success-icon svg { width: 32px; height: 32px; stroke: white; }
    h1 { color: #1a1a2e; font-size: 24px; margin-bottom: 8px; }
    .message { color: #666; font-size: 14px; margin-bottom: 24px; }
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #e5e7eb;
      border-top-color: #18b69b;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .redirect-text { color: #9ca3af; font-size: 13px; margin-bottom: 16px; }
    .manual-link { color: #18b69b; text-decoration: none; font-size: 14px; }
    .manual-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1>Successfully Connected!</h1>
    <p class="message">Your Forge API token has been encrypted and transmitted securely.</p>
    <div class="spinner"></div>
    <p class="redirect-text">Redirecting to Claude Desktop...</p>
    <a href="${escapeHtml(redirectUrl)}" class="manual-link">Click here if not redirected automatically</a>
  </div>
  <script>
    setTimeout(function() {
      window.location.href = ${JSON.stringify(redirectUrl)};
    }, 2000);
  </script>
</body>
</html>`;
}

/**
 * Render error page
 */
function renderErrorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error — Forge MCP</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 40px;
      text-align: center;
      max-width: 400px;
    }
    h1 { color: #dc2626; margin-bottom: 16px; }
    p { color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Error</h1>
    <p>${escapeHtml(message)}</p>
  </div>
</body>
</html>`;
}
