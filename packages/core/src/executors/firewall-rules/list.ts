import type { FirewallRulesResponse, ForgeFirewallRule } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function listFirewallRules(
  options: { server_id: string },
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
