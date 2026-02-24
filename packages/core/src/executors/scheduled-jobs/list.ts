import type { ForgeScheduledJob, ScheduledJobsResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * List scheduled jobs (cron) on a server.
 */
export async function listScheduledJobs(
  options: { server_id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeScheduledJob[]>> {
  const response = await ctx.client.get<ScheduledJobsResponse>(
    `/servers/${options.server_id}/jobs`,
  );
  const jobs = response.jobs;

  return {
    data: jobs,
  };
}
