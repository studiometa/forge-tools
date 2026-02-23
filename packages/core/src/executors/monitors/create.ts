import type { CreateMonitorData, ForgeMonitor, MonitorResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function createMonitor(
  options: { server_id: string } & CreateMonitorData,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeMonitor>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<MonitorResponse>(`/servers/${server_id}/monitors`, data);
  const monitor = response.monitor;

  return {
    data: monitor,
    text: `Monitor created: ${monitor.type} ${monitor.operator} ${monitor.threshold} (ID: ${monitor.id})`,
  };
}
