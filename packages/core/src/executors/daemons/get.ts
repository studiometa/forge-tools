import type { DaemonResponse, ForgeDaemon } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Get a single daemon.
 */
export async function getDaemon(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDaemon>> {
  const response = await ctx.client.get<DaemonResponse>(
    `/servers/${options.server_id}/daemons/${options.id}`,
  );
  const daemon = response.daemon;

  return {
    data: daemon,
  };
}
