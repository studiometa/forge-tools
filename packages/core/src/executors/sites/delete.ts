import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteSiteOptions } from "./types.ts";

/**
 * Delete a site.
 */
export async function deleteSite(
  options: DeleteSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.sites.delete, ctx, {
    server_id: options.server_id,
    site_id: options.site_id,
  });

  return {
    data: undefined,
  };
}
