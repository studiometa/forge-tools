import type { ForgeMonitor, MonitorsResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function listMonitors(
  options: { server_id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeMonitor[]>> {
  const response = await ctx.client.get<MonitorsResponse>(`/servers/${options.server_id}/monitors`);
  const monitors = response.monitors;
  return {
    data: monitors,
  };
}
