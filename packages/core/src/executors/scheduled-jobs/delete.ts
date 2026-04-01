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
  const route = options.site_id ? ROUTES.scheduledJobs.siteDelete : ROUTES.scheduledJobs.delete;
  const params: Record<string, string> = { server_id: options.server_id, id: options.id };
  if (options.site_id) params.site_id = options.site_id;

  await request(route, ctx, params);

  return {
    data: undefined,
  };
}
