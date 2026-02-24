import type { ForgeScheduledJob, ScheduledJobResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetScheduledJobOptions } from "./types.ts";

/**
 * Get a specific scheduled job.
 */
export async function getScheduledJob(
  options: GetScheduledJobOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeScheduledJob>> {
  const response = await ctx.client.get<ScheduledJobResponse>(
    `/servers/${options.server_id}/jobs/${options.id}`,
  );
  const job = response.job;

  return {
    data: job,
    text: [
      `Job: ${job.command} (ID: ${job.id})`,
      `User: ${job.user}`,
      `Frequency: ${job.frequency}`,
      `Cron: ${job.cron}`,
      `Status: ${job.status}`,
      `Created: ${job.created_at}`,
    ].join("\n"),
  };
}
