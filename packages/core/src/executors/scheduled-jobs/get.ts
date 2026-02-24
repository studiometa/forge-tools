import type { ForgeScheduledJob, ScheduledJobResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Get a specific scheduled job.
 */
export async function getScheduledJob(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeScheduledJob>> {
  const response = await ctx.client.get<ScheduledJobResponse>(
    `/servers/${options.server_id}/jobs/${options.id}`,
  );
  const job = response.job;

  return {
    data: job,
  };
}
