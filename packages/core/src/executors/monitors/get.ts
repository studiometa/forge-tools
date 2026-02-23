import type { ForgeMonitor, MonitorResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function getMonitor(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeMonitor>> {
  const response = await ctx.client.get<MonitorResponse>(
    `/servers/${options.server_id}/monitors/${options.id}`,
  );
  const monitor = response.monitor;

  return {
    data: monitor,
    text: `Monitor: ${monitor.type} ${monitor.operator} ${monitor.threshold} (ID: ${monitor.id})\nState: ${monitor.state}\nMinutes: ${monitor.minutes}`,
  };
}
