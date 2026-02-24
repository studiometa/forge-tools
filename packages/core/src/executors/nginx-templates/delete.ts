import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function deleteNginxTemplate(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/nginx/templates/${options.id}`);

  return {
    data: undefined,
  };
}
