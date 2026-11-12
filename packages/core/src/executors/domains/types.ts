/**
 * Option types for domain executors.
 */

import type { CreateDomainData } from "@studiometa/forge-api";

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
