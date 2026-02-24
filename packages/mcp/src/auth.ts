/**
 * Authentication utilities for Forge MCP HTTP server
 */

export interface ForgeCredentials {
  apiToken: string;
}

/**
 * Parse Bearer token containing Forge API credentials.
 * Token format: raw Forge API token (no base64 encoding needed).
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

  return { apiToken: token };
}
