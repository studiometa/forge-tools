import type { FirewallRulesResponse, ForgeFirewallRule } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListFirewallRulesOptions } from "./types.ts";

export async function listFirewallRules(
  options: ListFirewallRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeFirewallRule[]>> {
  const response = await ctx.client.get<FirewallRulesResponse>(
    `/servers/${options.server_id}/firewall-rules`,
  );
  const rules = response.rules;
  return {
    data: rules,
  };
}
