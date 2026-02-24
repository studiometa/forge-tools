/**
 * Option types for backup configuration executors.
 */

import type { CreateBackupConfigData } from "@studiometa/forge-api";

/**
 * Options for listing backup configurations for a server.
 */
export interface ListBackupConfigsOptions {
  server_id: string;
}

/**
 * Options for getting a single backup configuration.
 */
export interface GetBackupConfigOptions {
  server_id: string;
  id: string;
}

/**
 * Options for creating a backup configuration.
 */
export interface CreateBackupConfigOptions extends CreateBackupConfigData {
  server_id: string;
}

/**
 * Options for deleting a backup configuration.
 */
export interface DeleteBackupConfigOptions {
  server_id: string;
  id: string;
}
