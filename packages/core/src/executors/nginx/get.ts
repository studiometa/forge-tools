import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Get Nginx configuration for a site.
 */
export async function getNginxConfig(
  options: { server_id: string; site_id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const content = await ctx.client.get<string>(
    `/servers/${options.server_id}/sites/${options.site_id}/nginx`,
  );

  return {
    data: content,
  };
}
