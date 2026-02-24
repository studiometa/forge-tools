/**
 * Option types for SSH key executors.
 */

import type { CreateSshKeyData } from "@studiometa/forge-api";

/**
 * Options for listing SSH keys on a server.
 */
export interface ListSshKeysOptions {
  server_id: string;
}

/**
 * Options for getting a single SSH key.
 */
export interface GetSshKeyOptions {
  server_id: string;
  id: string;
}

/**
 * Options for creating an SSH key.
 */
export interface CreateSshKeyOptions extends CreateSshKeyData {
  server_id: string;
}

/**
 * Options for deleting an SSH key.
 */
export interface DeleteSshKeyOptions {
  server_id: string;
  id: string;
}
