/**
 * Option types for environment variable executors.
 */

/**
 * Options for getting environment variables for a site.
 */
export interface GetEnvOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for updating environment variables for a site.
 */
export interface UpdateEnvOptions {
  server_id: string;
  site_id: string;
  content: string;
}
