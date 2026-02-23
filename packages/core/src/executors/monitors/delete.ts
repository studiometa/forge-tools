import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function deleteMonitor(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/monitors/${options.id}`);

  return {
    data: undefined,
    text: `Monitor ${options.id} deleted.`,
  };
}
