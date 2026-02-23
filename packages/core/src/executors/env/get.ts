import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Get environment variables for a site.
 */
export async function getEnv(
  options: { server_id: string; site_id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const content = await ctx.client.get<string>(
    `/servers/${options.server_id}/sites/${options.site_id}/env`,
  );

  return {
    data: content,
    text: `Environment variables:\n${content}`,
  };
}
