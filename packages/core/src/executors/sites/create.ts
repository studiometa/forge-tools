import type { ForgeSite, SiteResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateSiteOptions } from "./types.ts";

/**
 * Create a new site on a server.
 */
export async function createSite(
  options: CreateSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSite>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<SiteResponse>(`/servers/${server_id}/sites`, data);
  const site = response.site;

  return {
    data: site,
    text: `Site "${site.name}" created on server ${server_id} (ID: ${site.id}).`,
  };
}
