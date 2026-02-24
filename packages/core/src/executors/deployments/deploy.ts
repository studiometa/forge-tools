import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export interface DeploySiteOptions {
  server_id: string;
  site_id: string;
}

/**
 * Trigger a deployment for a site.
 */
export async function deploySite(
  options: DeploySiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(`/servers/${options.server_id}/sites/${options.site_id}/deployment/deploy`);

  return {
    data: undefined,
  };
}
