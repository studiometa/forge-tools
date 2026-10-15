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

/**
 * Options for getting the Nginx configuration for one domain of a site.
 */
export interface GetDomainNginxConfigOptions {
  server_id: string;
  site_id: string;
  /** Domain record ID, or domain name (e.g. "www.example.com") resolved on the site. */
  domain: string;
}

/**
 * Options for updating the Nginx configuration for one domain of a site.
 */
export interface UpdateDomainNginxConfigOptions extends GetDomainNginxConfigOptions {
  content: string;
}
