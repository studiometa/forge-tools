/**
 * Option types for security rule executors.
 */

import type { CreateSecurityRuleData } from "@studiometa/forge-api";

/**
 * Options for listing security rules for a site.
 */
export interface ListSecurityRulesOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for getting a single security rule.
 */
export interface GetSecurityRuleOptions {
  server_id: string;
  site_id: string;
  id: string;
}

/**
 * Options for creating a security rule.
 */
export interface CreateSecurityRuleOptions extends CreateSecurityRuleData {
  server_id: string;
  site_id: string;
}

/**
 * Options for deleting a security rule.
 */
export interface DeleteSecurityRuleOptions {
  server_id: string;
  site_id: string;
  id: string;
}
