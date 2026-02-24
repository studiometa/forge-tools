import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetNginxConfigOptions } from "./types.ts";

/**
 * Get Nginx configuration for a site.
 */
export async function getNginxConfig(
  options: GetNginxConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const content = await ctx.client.get<string>(
    `/servers/${options.server_id}/sites/${options.site_id}/nginx`,
  );

  return {
    data: content,
    text: `Nginx configuration:\n${content}`,
  };
}
