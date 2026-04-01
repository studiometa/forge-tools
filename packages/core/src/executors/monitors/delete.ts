import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteMonitorOptions } from "./types.ts";

/**
 * Delete a monitor.
 */
export async function deleteMonitor(
  options: DeleteMonitorOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.monitors.delete, ctx, { server_id: options.server_id, id: options.id });

  return {
    data: undefined,
  };
}
