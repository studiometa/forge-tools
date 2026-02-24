import type { ForgeMonitor, MonitorsResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListMonitorsOptions } from "./types.ts";

export async function listMonitors(
  options: ListMonitorsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeMonitor[]>> {
  const response = await ctx.client.get<MonitorsResponse>(`/servers/${options.server_id}/monitors`);
  const monitors = response.monitors;
  const lines = monitors.map(
    (m) => `• ${m.type} ${m.operator} ${m.threshold} (ID: ${m.id}) — ${m.state}`,
  );

  return {
    data: monitors,
    text:
      monitors.length > 0
        ? `${monitors.length} monitor(s):\n${lines.join("\n")}`
        : "No monitors found.",
  };
}
