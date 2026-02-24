import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Delete a scheduled job.
 */
export async function deleteScheduledJob(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/jobs/${options.id}`);

  return {
    data: undefined,
    text: `Scheduled job ${options.id} deleted.`,
  };
}
