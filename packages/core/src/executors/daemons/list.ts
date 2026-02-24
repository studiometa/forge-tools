import type { DaemonsResponse, ForgeDaemon } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * List daemons (background processes) on a server.
 */
export async function listDaemons(
  options: { server_id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDaemon[]>> {
  const response = await ctx.client.get<DaemonsResponse>(`/servers/${options.server_id}/daemons`);
  const daemons = response.daemons;

  return {
    data: daemons,
  };
}
