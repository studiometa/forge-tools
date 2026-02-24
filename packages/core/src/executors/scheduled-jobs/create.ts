import type {
  CreateScheduledJobData,
  ForgeScheduledJob,
  ScheduledJobResponse,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Create a new scheduled job (cron).
 */
export async function createScheduledJob(
  options: { server_id: string } & CreateScheduledJobData,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeScheduledJob>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<ScheduledJobResponse>(`/servers/${server_id}/jobs`, data);
  const job = response.job;

  return {
    data: job,
    text: `Scheduled job created: "${job.command}" (ID: ${job.id}) — ${job.frequency}`,
  };
}
