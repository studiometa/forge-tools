import type { ForgeSite, SiteResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface GetSiteOptions {
  server_id: number;
  site_id: number;
}

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
    text: [
      `Site: ${site.name} (ID: ${site.id})`,
      `Type: ${site.project_type}`,
      `Directory: ${site.directory}`,
      `Repository: ${site.repository ?? "none"}`,
      `Branch: ${site.repository_branch ?? "none"}`,
      `Status: ${site.status}`,
      `Deploy status: ${site.deployment_status ?? "none"}`,
      `Quick deploy: ${site.quick_deploy ? "enabled" : "disabled"}`,
      `PHP: ${site.php_version}`,
      `Created: ${site.created_at}`,
    ].join("\n"),
  };
}
