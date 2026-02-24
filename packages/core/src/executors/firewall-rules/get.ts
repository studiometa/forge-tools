import type { FirewallRuleResponse, ForgeFirewallRule } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function getFirewallRule(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeFirewallRule>> {
  const response = await ctx.client.get<FirewallRuleResponse>(
    `/servers/${options.server_id}/firewall-rules/${options.id}`,
  );
  const rule = response.rule;

  return {
    data: rule,
  };
}
