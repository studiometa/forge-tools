import type { BackupConfigResponse, ForgeBackupConfig } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Get a specific backup configuration.
 */
export async function getBackupConfig(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeBackupConfig>> {
  const response = await ctx.client.get<BackupConfigResponse>(
    `/servers/${options.server_id}/backup-configs/${options.id}`,
  );
  const backup = response.backup;

  return {
    data: backup,
  };
}
