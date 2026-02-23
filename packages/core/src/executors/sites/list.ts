import type { ForgeSite, SitesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface ListSitesOptions {
  server_id: number;
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

  const lines = sites.map((s) => `• ${s.name} (ID: ${s.id}) — ${s.project_type} — ${s.status}`);

  return {
    data: sites,
    text:
      sites.length > 0
        ? `${sites.length} site(s) on server ${options.server_id}:\n${lines.join("\n")}`
        : `No sites on server ${options.server_id}.`,
  };
}
