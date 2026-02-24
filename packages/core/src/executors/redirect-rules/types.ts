/**
 * Option types for redirect rule executors.
 */

import type { CreateRedirectRuleData } from "@studiometa/forge-api";

/**
 * Options for listing redirect rules for a site.
 */
export interface ListRedirectRulesOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for getting a single redirect rule.
 */
export interface GetRedirectRuleOptions {
  server_id: string;
  site_id: string;
  id: string;
}

/**
 * Options for creating a redirect rule.
 */
export interface CreateRedirectRuleOptions extends CreateRedirectRuleData {
  server_id: string;
  site_id: string;
}

/**
 * Options for deleting a redirect rule.
 */
export interface DeleteRedirectRuleOptions {
  server_id: string;
  site_id: string;
  id: string;
}
