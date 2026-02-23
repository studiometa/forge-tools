import type { ForgeConfig } from "./types.ts";
import type { ConfigStoreFs } from "./utils/config-store.ts";

import { ConfigStore } from "./utils/config-store.ts";

const APP_NAME = "forge-tools";
const ENV_VAR = "FORGE_API_TOKEN";

/**
 * Create a ConfigStore for Forge tools.
 */
export function createConfigStore(fs?: ConfigStoreFs): ConfigStore<ForgeConfig> {
  return new ConfigStore<ForgeConfig>(APP_NAME, fs);
}

/**
 * Get the Forge API token.
 *
 * Resolution priority:
 * 1. Environment variable FORGE_API_TOKEN
 * 2. Config file (~/.config/forge-tools/config.json)
 *
 * @returns The API token or null if not configured.
 */
export function getToken(configStore?: ConfigStore<ForgeConfig>): string | null {
  // 1. Environment variable
  const envToken = process.env[ENV_VAR];
  if (envToken) {
    return envToken;
  }

  // 2. Config file
  const store = configStore ?? createConfigStore();
  return store.getField("apiToken") ?? null;
}

/**
 * Save the Forge API token to the config file.
 */
export function setToken(token: string, configStore?: ConfigStore<ForgeConfig>): void {
  const store = configStore ?? createConfigStore();
  store.update({ apiToken: token });
}

/**
 * Delete the stored Forge API token.
 */
export function deleteToken(configStore?: ConfigStore<ForgeConfig>): void {
  const store = configStore ?? createConfigStore();
  store.delete();
}
