/**
 * Option types for daemon executors.
 */

import type { CreateDaemonData } from "@studiometa/forge-api";

/**
 * Options for listing daemons on a server.
 */
export interface ListDaemonsOptions {
  server_id: string;
}

/**
 * Options for getting a single daemon.
 */
export interface GetDaemonOptions {
  server_id: string;
  id: string;
}

/**
 * Options for creating a daemon.
 */
export interface CreateDaemonOptions extends CreateDaemonData {
  server_id: string;
}

/**
 * Options for deleting a daemon.
 */
export interface DeleteDaemonOptions {
  server_id: string;
  id: string;
}

/**
 * Options for restarting a daemon.
 */
export interface RestartDaemonOptions {
  server_id: string;
  id: string;
}
