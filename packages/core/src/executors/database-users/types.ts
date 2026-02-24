/**
 * Option types for database user executors.
 */

import type { CreateDatabaseUserData } from "@studiometa/forge-api";

/**
 * Options for listing database users on a server.
 */
export interface ListDatabaseUsersOptions {
  server_id: string;
}

/**
 * Options for getting a single database user.
 */
export interface GetDatabaseUserOptions {
  server_id: string;
  id: string;
}

/**
 * Options for creating a database user.
 */
export interface CreateDatabaseUserOptions extends CreateDatabaseUserData {
  server_id: string;
}

/**
 * Options for deleting a database user.
 */
export interface DeleteDatabaseUserOptions {
  server_id: string;
  id: string;
}
