import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeploySiteOptions } from "./types.ts";

/**
 * Trigger a deployment for a site.
 */
export async function deploySite(
  options: DeploySiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  // The spec defines no request body for a deployment.
  await request(ROUTES.deployments.create, ctx, {
    server_id: options.server_id,
    site_id: options.site_id,
  });

  return {
    data: undefined,
  };
}
