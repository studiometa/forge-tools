import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateFirewallRuleOptions } from "./types.ts";

/**
 * Create a firewall rule.
 */
export async function createFirewallRule(
  options: CreateFirewallRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, ...data } = options;
  await request(ROUTES.firewallRules.create, ctx, { server_id }, { body: data });

  return { data: undefined };
}
