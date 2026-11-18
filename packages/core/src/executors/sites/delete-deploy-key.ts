import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { SiteDeployKeyOptions } from "./types.ts";

/**
 * Delete the deploy key of a site.
 */
export async function deleteSiteDeployKey(
  options: SiteDeployKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.sites.deleteDeployKey, ctx, {
    server_id: options.server_id,
    site_id: options.site_id,
  });

  return {
    data: undefined,
  };
}
