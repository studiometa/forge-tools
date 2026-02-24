/**
 * Option types for command executors.
 */

/**
 * Options for listing commands executed on a site.
 */
export interface ListCommandsOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for getting a single command.
 */
export interface GetCommandOptions {
  server_id: string;
  site_id: string;
  id: string;
}

/**
 * Options for executing a command on a site.
 */
export interface CreateCommandOptions {
  server_id: string;
  site_id: string;
  command: string;
}
