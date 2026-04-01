import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteScheduledJobOptions } from "./types.ts";

/**
 * Delete a scheduled job.
 */
export async function deleteScheduledJob(
  options: DeleteScheduledJobOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.scheduledJobs.delete, ctx, { server_id: options.server_id, id: options.id });

  return {
    data: undefined,
  };
}
