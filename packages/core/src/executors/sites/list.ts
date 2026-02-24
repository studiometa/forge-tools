import type { ForgeSite, SitesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface ListSitesOptions {
  server_id: string;
}

/**
 * List all sites on a server.
 */
export async function listSites(
  options: ListSitesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSite[]>> {
  const response = await ctx.client.get<SitesResponse>(`/servers/${options.server_id}/sites`);
  const sites = response.sites;

  return {
    data: sites,
  };
}
