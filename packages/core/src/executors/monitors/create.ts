import type { ForgeMonitor, MonitorResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateMonitorOptions } from "./types.ts";

export async function createMonitor(
  options: CreateMonitorOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeMonitor>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<MonitorResponse>(`/servers/${server_id}/monitors`, data);
  const monitor = response.monitor;

  return {
    data: monitor,
  };
}
