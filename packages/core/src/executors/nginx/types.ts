/**
 * Option types for Nginx configuration executors.
 */

/**
 * Options for getting the Nginx configuration for a site.
 */
export interface GetNginxConfigOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for updating the Nginx configuration for a site.
 */
export interface UpdateNginxConfigOptions {
  server_id: string;
  site_id: string;
  content: string;
}
