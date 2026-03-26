import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { DeploySiteOptions } from "./types.ts";

/**
 * Trigger a deployment for a site.
 */
export async function deploySite(
  options: DeploySiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(`${sitePath(options.server_id, options.site_id, ctx)}/deployments`, {});

  return {
    data: undefined,
  };
}
