import type { ForgeScheduledJob, ScheduledJobsResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListScheduledJobsOptions } from "./types.ts";

/**
 * List scheduled jobs (cron) on a server.
 */
export async function listScheduledJobs(
  options: ListScheduledJobsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeScheduledJob[]>> {
  const response = await ctx.client.get<ScheduledJobsResponse>(
    `/servers/${options.server_id}/jobs`,
  );
  const jobs = response.jobs;

  const lines = jobs.map(
    (j) => `• ${j.command} (ID: ${j.id}) — ${j.frequency} — ${j.status} — user: ${j.user}`,
  );

  return {
    data: jobs,
    text:
      jobs.length > 0
        ? `${jobs.length} scheduled job(s):\n${lines.join("\n")}`
        : "No scheduled jobs found.",
  };
}
