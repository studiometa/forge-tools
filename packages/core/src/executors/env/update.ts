import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { UpdateEnvOptions } from "./types.ts";

/**
 * Update environment variables for a site.
 */
export async function updateEnv(
  options: UpdateEnvOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.put(`${sitePath(options.server_id, options.site_id, ctx)}/environment`, {
    content: options.content,
  });

  return {
    data: undefined,
  };
}
