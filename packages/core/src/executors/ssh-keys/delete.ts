import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function deleteSshKey(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/keys/${options.id}`);

  return {
    data: undefined,
    text: `SSH key ${options.id} deleted.`,
  };
}
