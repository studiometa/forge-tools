import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function deleteRedirectRule(
  options: { server_id: string; site_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(
    `/servers/${options.server_id}/sites/${options.site_id}/redirect-rules/${options.id}`,
  );

  return {
    data: undefined,
  };
}
