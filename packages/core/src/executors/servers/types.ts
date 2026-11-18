/**
 * Option types for server executors.
 */

import type { CreateServerData, UpdateServerData } from "@studiometa/forge-api";

/**
 * Options for listing servers.
 */
export interface ListServersOptions {
  // Forge servers endpoint takes no filter params currently
}

/**
 * Options for getting a single server.
 */
export interface GetServerOptions {
  server_id: string;
}

/**
 * Options for creating a server.
 */
export interface CreateServerOptions extends CreateServerData {}

/**
 * Options for updating a server: its name, IP addresses, timezone or tags.
 */
export interface UpdateServerOptions extends UpdateServerData {
  server_id: string;
}

/**
 * Options for deleting a server.
 */
export interface DeleteServerOptions {
  server_id: string;
}

/**
 * Options for rebooting a server.
 */
export interface RebootServerOptions {
  server_id: string;
}
