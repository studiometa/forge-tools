import type { ForgeScheduledJob, ScheduledJobResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateScheduledJobOptions } from "./types.ts";

/**
 * Create a new scheduled job (cron).
 */
export async function createScheduledJob(
  options: CreateScheduledJobOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeScheduledJob>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<ScheduledJobResponse>(`/servers/${server_id}/jobs`, data);
  const job = response.job;

  return {
    data: job,
  };
}
