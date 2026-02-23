import type { ForgeDeployment, DeploymentsResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface ListDeploymentsOptions {
  server_id: string;
  site_id: string;
}

/**
 * List all deployments for a site.
 */
export async function listDeployments(
  options: ListDeploymentsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDeployment[]>> {
  const response = await ctx.client.get<DeploymentsResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/deployments`,
  );
  const deployments = response.deployments;

  const lines = deployments.map(
    (d) =>
      `• #${d.id} — ${d.status} — ${d.commit_hash?.slice(0, 7) ?? "no commit"} — ${d.started_at}`,
  );

  return {
    data: deployments,
    text:
      deployments.length > 0
        ? `${deployments.length} deployment(s):\n${lines.join("\n")}`
        : "No deployments found.",
  };
}
