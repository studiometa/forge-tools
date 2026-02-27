/**
 * Authentication utilities for Forge MCP HTTP server
 *
 * Supports two token formats:
 * 1. Raw Forge API token (backwards compatible)
 * 2. Base64-encoded Forge API token (from OAuth flow)
 *
 * Detection heuristic: If the token decodes from base64 to valid UTF-8
 * and looks like a raw Forge token (no colons, no whitespace), we treat
 * the original token as raw. If it decodes to something that looks like
 * a different token, we use the decoded version.
 *
 * In practice, Forge API tokens are alphanumeric strings. The base64 OAuth
 * tokens are base64(apiToken). Since base64 encoding always produces a
 * different string than the input (padding, charset), we can distinguish them.
 */

export interface ForgeCredentials {
  apiToken: string;
}

/**
 * Check if a string looks like a valid base64-encoded string.
 * Returns the decoded string if it is, null otherwise.
 */
function tryDecodeBase64(token: string): string | null {
  // Base64 strings only contain A-Z, a-z, 0-9, +, /, = (or base64url: -, _)
  // But raw Forge tokens are also alphanumeric, so we need a better heuristic.
  //
  // Strategy: try to decode as base64. If re-encoding the decoded value
  // produces the original token, it's base64-encoded.
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");

    // Guard: decoded must be non-empty and different from input
    if (!decoded || decoded === token) {
      return null;
    }

    // Re-encode and compare — if it roundtrips, it's a real base64 token
    const reEncoded = Buffer.from(decoded).toString("base64");
    if (reEncoded === token) {
      return decoded;
    }

    return null;
  } catch {
    return null;
  }
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
