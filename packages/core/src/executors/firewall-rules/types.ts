/**
 * Option types for firewall rule executors.
 */

import type { CreateFirewallRuleData } from "@studiometa/forge-api";

/**
 * Options for listing firewall rules on a server.
 */
export interface ListFirewallRulesOptions {
  server_id: string;
}

/**
 * Options for getting a single firewall rule.
 */
export interface GetFirewallRuleOptions {
  server_id: string;
  id: string;
}

/**
 * Options for creating a firewall rule.
 */
export interface CreateFirewallRuleOptions extends CreateFirewallRuleData {
  server_id: string;
}

/**
 * Options for deleting a firewall rule.
 */
export interface DeleteFirewallRuleOptions {
  server_id: string;
  id: string;
}
