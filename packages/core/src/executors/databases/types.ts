/**
 * Option types for database executors.
 */

import type { CreateDatabaseData } from "@studiometa/forge-api";

/**
 * Options for listing databases on a server.
 */
export interface ListDatabasesOptions {
  server_id: string;
}

/**
 * Options for getting a single database.
 */
export interface GetDatabaseOptions {
  server_id: string;
  id: string;
}

/**
 * Options for creating a database.
 */
export interface CreateDatabaseOptions extends CreateDatabaseData {
  server_id: string;
}

/**
 * Options for deleting a database.
 */
export interface DeleteDatabaseOptions {
  server_id: string;
  id: string;
}
