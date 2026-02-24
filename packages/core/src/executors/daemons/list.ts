import type { DaemonsResponse, ForgeDaemon } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListDaemonsOptions } from "./types.ts";

/**
 * List daemons (background processes) on a server.
 */
export async function listDaemons(
  options: ListDaemonsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDaemon[]>> {
  const response = await ctx.client.get<DaemonsResponse>(`/servers/${options.server_id}/daemons`);
  const daemons = response.daemons;

  const lines = daemons.map((d) => `• ${d.command} (ID: ${d.id}) — user: ${d.user} — ${d.status}`);

  return {
    data: daemons,
    text:
      daemons.length > 0
        ? `${daemons.length} daemon(s):\n${lines.join("\n")}`
        : "No daemons found.",
  };
}
