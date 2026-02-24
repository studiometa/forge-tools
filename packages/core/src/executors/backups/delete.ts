import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Delete a backup configuration.
 */
export async function deleteBackupConfig(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/backup-configs/${options.id}`);

  return {
    data: undefined,
    text: `Backup config ${options.id} deleted.`,
  };
}
