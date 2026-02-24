import type { ForgeMonitor, MonitorResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetMonitorOptions } from "./types.ts";

export async function getMonitor(
  options: GetMonitorOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeMonitor>> {
  const response = await ctx.client.get<MonitorResponse>(
    `/servers/${options.server_id}/monitors/${options.id}`,
  );
  const monitor = response.monitor;

  return {
    data: monitor,
  };
}
