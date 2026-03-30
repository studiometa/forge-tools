import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteDaemonOptions } from "./types.ts";

/**
 * Delete a daemon.
 */
export async function deleteDaemon(
  options: DeleteDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.daemons.delete, ctx, { server_id: options.server_id, id: options.id });

  return {
    data: undefined,
  };
}
