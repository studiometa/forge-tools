/**
 * CLI flag parsers shared between stdio and HTTP entry points.
 *
 * Extracted to a separate module so that both `index.ts` (stdio) and
 * `server.ts` (HTTP) can import it without creating a shared dependency
 * that triggers Vite code-splitting — which would break the `isMainModule`
 * guard in `index.ts`.
 *
 * See: https://github.com/studiometa/forge-tools/issues/63
 */

/**
 * Parse read-only flag from process.argv and environment.
 *
 * Supports:
 * - `--read-only` CLI flag
 * - `FORGE_READ_ONLY=true` environment variable
 */
export function parseReadOnlyFlag(): boolean {
  return process.argv.includes("--read-only") || process.env.FORGE_READ_ONLY === "true";
}
