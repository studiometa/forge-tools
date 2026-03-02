/**
 * Config loading for forge.
 *
 * Resolution priority (highest to lowest):
 * 1. CLI arguments (--token)
 * 2. Environment variable (FORGE_API_TOKEN)
 * 3. Config file (XDG-compliant)
 */

import { createConfigStore, getToken } from "@studiometa/forge-api";

export interface ForgeCliConfig {
  /** Forge API token */
  apiToken: string | undefined;
}

/**
 * Resolve config from multiple sources with priority order.
 */
export function getConfig(
  cliOptions?: Record<string, string | boolean | string[]>,
): ForgeCliConfig {
  // 1. CLI argument --token
  const cliToken = cliOptions?.token;

  // 2. Environment variable / config file (handled by getToken)
  const storedToken = getToken(createConfigStore());

  return {
    apiToken: typeof cliToken === "string" ? cliToken : (storedToken ?? undefined),
  };
}

export { createConfigStore, getToken, setToken, deleteToken } from "@studiometa/forge-api";
