import type { SiteAttributes } from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";
import { getSite } from "./get.ts";

import type { UpdateSiteOptions } from "./types.ts";

/**
 * Update an existing site on a server, and return the site.
 *
 * Forge answers the update with `202 Accepted` and no body: the site is read again after it.
 */
export async function updateSite(
  options: UpdateSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SiteAttributes & { id: number }>> {
  const { server_id, site_id, ...data } = options;
  await request(ROUTES.sites.update, ctx, { server_id, site_id }, { body: data });

  return getSite({ server_id, site_id }, ctx);
}
