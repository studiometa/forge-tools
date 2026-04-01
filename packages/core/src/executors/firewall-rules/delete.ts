import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteFirewallRuleOptions } from "./types.ts";

/**
 * Delete a firewall rule.
 */
export async function deleteFirewallRule(
  options: DeleteFirewallRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.firewallRules.delete, ctx, { server_id: options.server_id, id: options.id });

  return {
    data: undefined,
  };
}
