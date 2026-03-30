import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { DeleteSiteOptions } from "./types.ts";

/**
 * Delete a site.
 */
export async function deleteSite(
  options: DeleteSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(sitePath(options.server_id, options.site_id, ctx));

  return {
    data: undefined,
  };
}
