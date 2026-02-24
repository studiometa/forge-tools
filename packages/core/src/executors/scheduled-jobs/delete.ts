import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteScheduledJobOptions } from "./types.ts";

/**
 * Delete a scheduled job.
 */
export async function deleteScheduledJob(
  options: DeleteScheduledJobOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/jobs/${options.id}`);

  return {
    data: undefined,
    text: `Scheduled job ${options.id} deleted.`,
  };
}
