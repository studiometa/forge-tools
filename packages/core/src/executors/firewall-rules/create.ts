import type { FirewallRuleResponse, ForgeFirewallRule } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateFirewallRuleOptions } from "./types.ts";

export async function createFirewallRule(
  options: CreateFirewallRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeFirewallRule>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<FirewallRuleResponse>(
    `/servers/${server_id}/firewall-rules`,
    data,
  );
  const rule = response.rule;

  return {
    data: rule,
    text: `Firewall rule created: ${rule.name} (ID: ${rule.id}) — port: ${rule.port}`,
  };
}
