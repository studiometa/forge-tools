import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function deleteSecurityRule(
  options: { server_id: string; site_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(
    `/servers/${options.server_id}/sites/${options.site_id}/security-rules/${options.id}`,
  );

  return {
    data: undefined,
    text: `Security rule ${options.id} deleted.`,
  };
}
