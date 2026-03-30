import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { DeleteScheduledJobOptions } from "./types.ts";

/**
 * Delete a scheduled job.
 */
export async function deleteScheduledJob(
  options: DeleteScheduledJobOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`${serverPath(options.server_id, ctx)}/scheduled-jobs/${options.id}`);

  return {
    data: undefined,
  };
}
