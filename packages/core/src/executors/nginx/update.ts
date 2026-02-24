import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { UpdateNginxConfigOptions } from "./types.ts";

/**
 * Update Nginx configuration for a site.
 */
export async function updateNginxConfig(
  options: UpdateNginxConfigOptions,
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
