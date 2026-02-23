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
  const lines = rules.map(
    (r) => `• ${r.name} (ID: ${r.id}) — port: ${r.port} — ${r.ip_address} — ${r.status}`,
  );

  return {
    data: rules,
    text:
      rules.length > 0
        ? `${rules.length} firewall rule(s):\n${lines.join("\n")}`
        : "No firewall rules found.",
  };
}
