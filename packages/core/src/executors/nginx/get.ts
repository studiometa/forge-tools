import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetNginxConfigOptions } from "./types.ts";

/**
 * Get Nginx configuration for a site.
 */
export async function getNginxConfig(
  options: GetNginxConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const content = await ctx.client.get<string>(
    `${sitePath(options.server_id, options.site_id, ctx)}/nginx`,
  );

  return {
    data: content,
  };
}
