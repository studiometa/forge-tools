import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Update environment variables for a site.
 */
export async function updateEnv(
  options: { server_id: string; site_id: string; content: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.put(`/servers/${options.server_id}/sites/${options.site_id}/env`, {
    content: options.content,
  });

  return {
    data: undefined,
    text: "Environment variables updated.",
  };
}
