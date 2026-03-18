import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { UpdateNginxConfigOptions } from "./types.ts";

/**
 * Update Nginx configuration for a site.
 */
export async function updateNginxConfig(
  options: UpdateNginxConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.put(`${sitePath(options.server_id, options.site_id, ctx)}/nginx`, {
    content: options.content,
  });

  return {
    data: undefined,
  };
}
