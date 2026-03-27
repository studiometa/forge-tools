/**
 * Option types for site executors.
 */

import type { CreateSiteData } from "@studiometa/forge-api";

/**
 * Options for listing sites on a server.
 */
export interface ListSitesOptions {
  server_id: string;
}

/**
 * Options for getting a single site.
 */
export interface GetSiteOptions {
  /**
   * Server ID — kept for caller compatibility but unused in v2.
   * The v2 API retrieves sites via the org-scoped path `/orgs/{slug}/sites/{id}`.
   */
  server_id: string;
  site_id: string;
}

/**
 * Options for creating a site on a server.
 */
export interface CreateSiteOptions extends CreateSiteData {
  server_id: string;
}

/**
 * Options for deleting a site.
 */
export interface DeleteSiteOptions {
  server_id: string;
  site_id: string;
}
