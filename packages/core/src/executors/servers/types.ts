/**
 * Option types for server executors.
 */

import type {
  CreateServerData,
  UpdateServerData,
  UpdateServerNetworkData,
} from "@studiometa/forge-api";

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
 * Options for listing the network of a server.
 */
export interface GetServerNetworkOptions {
  server_id: string;
}

/**
 * Options for setting the network of a server: `servers` replaces the current list.
 */
export interface UpdateServerNetworkOptions extends UpdateServerNetworkData {
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
