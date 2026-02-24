import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteFirewallRuleOptions } from "./types.ts";

export async function deleteFirewallRule(
  options: DeleteFirewallRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/firewall-rules/${options.id}`);

  return {
    data: undefined,
    text: `Firewall rule ${options.id} deleted.`,
  };
}
