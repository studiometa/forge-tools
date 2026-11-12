/**
 * Option types for domain executors.
 */

import type { CreateDomainData, UpdateDomainData } from "@studiometa/forge-api";

/**
 * Options for listing the domains of a site.
 */
export interface ListDomainsOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for adding a domain (an alias) to a site.
 */
export interface CreateDomainOptions extends CreateDomainData {
  server_id: string;
  site_id: string;
}

/**
 * Options for updating a domain of a site, e.g. its `www` redirect.
 */
export interface UpdateDomainOptions extends UpdateDomainData {
  server_id: string;
  site_id: string;
  domain_id: string;
}
