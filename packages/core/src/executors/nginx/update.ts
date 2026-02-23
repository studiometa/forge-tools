import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Update Nginx configuration for a site.
 */
export async function updateNginxConfig(
  options: { server_id: string; site_id: string; content: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.put(`/servers/${options.server_id}/sites/${options.site_id}/nginx`, {
    content: options.content,
  });

  return {
    data: undefined,
    text: "Nginx configuration updated.",
  };
}
