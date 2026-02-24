import type { ForgeSite, SiteResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetSiteOptions } from "./types.ts";

/**
 * Get a specific site by ID.
 */
export async function getSite(
  options: GetSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSite>> {
  const response = await ctx.client.get<SiteResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}`,
  );
  const site = response.site;

  return {
    data: site,
  };
}
