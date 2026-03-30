import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { RestartDaemonOptions } from "./types.ts";

/**
 * Restart a daemon.
 */
export async function restartDaemon(
  options: RestartDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.daemons.action,
    ctx,
    { server_id: options.server_id, id: options.id },
    { body: { action: "restart" } },
  );

  return {
    data: undefined,
  };
}
