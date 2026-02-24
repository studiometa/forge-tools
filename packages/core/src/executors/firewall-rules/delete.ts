import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function deleteFirewallRule(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/firewall-rules/${options.id}`);

  return {
    data: undefined,
  };
}
