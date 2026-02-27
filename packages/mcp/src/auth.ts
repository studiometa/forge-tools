/**
 * Authentication utilities for Forge MCP HTTP server
 *
 * Supports two token formats:
 * 1. Raw Forge API token (backwards compatible)
 * 2. Base64-encoded Forge API token (from OAuth flow)
 *
 * Detection heuristic: decode the token from base64, then re-encode.
 * If the re-encoded string matches the original, it's a real base64 token
 * and we use the decoded value. Otherwise, we treat it as a raw token.
 */

export interface ForgeCredentials {
  apiToken: string;
}

/**
 * Try to decode a base64-encoded token.
 * Returns the decoded string if re-encoding produces the original, null otherwise.
 *
 * Buffer.from(str, 'base64') never throws — it silently ignores invalid chars.
 * So this function cannot fail, no try/catch needed.
 */
function tryDecodeBase64(token: string): string | null {
  const decoded = Buffer.from(token, "base64").toString("utf-8");

  // decoded must be non-empty and different from input
  if (!decoded || decoded === token) {
    return null;
  }

  // Re-encode and compare — if it roundtrips, it was genuinely base64
  const reEncoded = Buffer.from(decoded).toString("base64");
  if (reEncoded === token) {
    return decoded;
  }

  return null;
}

/**
 * Parse Bearer token containing Forge API credentials.
 *
 * Token formats:
 * - Raw Forge API token (e.g., "Bearer my-api-token")
 * - Base64-encoded token from OAuth flow (e.g., "Bearer base64(apiToken)")
 *
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns Parsed credentials or null if invalid
 */
export function parseAuthHeader(authHeader: string | undefined | null): ForgeCredentials | null {
  if (!authHeader) {
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }

  const token = match[1].trim();

  if (!token) {
    return null;
  }

  // Try to decode as base64 (OAuth access token)
  const decoded = tryDecodeBase64(token);
  if (decoded) {
    return { apiToken: decoded };
  }

  // Treat as raw Forge API token (backwards compatible)
  return { apiToken: token };
}
