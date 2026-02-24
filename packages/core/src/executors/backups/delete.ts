import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteBackupConfigOptions } from "./types.ts";

/**
 * Delete a backup configuration.
 */
export async function deleteBackupConfig(
  options: DeleteBackupConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/backup-configs/${options.id}`);

  return {
    data: undefined,
  };
}
