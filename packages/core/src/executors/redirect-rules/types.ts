/**
 * Option types for redirect rule executors.
 */

import type { CreateRedirectRuleData, ReorderRedirectRulesData } from "@studiometa/forge-api";

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
 * Options for exporting the redirect rules of a site as CSV.
 */
export interface ExportRedirectRulesOptions {
  server_id: string;
  site_id: string;
}

/** How an import applies to the rules of the site: add to them, or replace them. */
export type RedirectImportMode = "append" | "replace";

/**
 * Options for importing redirect rules from CSV.
 */
export interface ImportRedirectRulesOptions {
  server_id: string;
  site_id: string;
  /** CSV content with a `from,to,type` header row. */
  csv: string;
  mode: RedirectImportMode;
}

/**
 * Options for ordering the redirect rules of a site.
 */
export interface ReorderRedirectRulesOptions extends ReorderRedirectRulesData {
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
