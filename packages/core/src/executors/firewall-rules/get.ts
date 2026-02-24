import type { FirewallRuleResponse, ForgeFirewallRule } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetFirewallRuleOptions } from "./types.ts";

export async function getFirewallRule(
  options: GetFirewallRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeFirewallRule>> {
  const response = await ctx.client.get<FirewallRuleResponse>(
    `/servers/${options.server_id}/firewall-rules/${options.id}`,
  );
  const rule = response.rule;

  return {
    data: rule,
    text: `Firewall Rule: ${rule.name} (ID: ${rule.id})\nPort: ${rule.port}\nType: ${rule.type}\nIP: ${rule.ip_address}\nStatus: ${rule.status}`,
  };
}
