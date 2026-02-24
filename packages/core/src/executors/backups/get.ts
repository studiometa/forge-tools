import type { BackupConfigResponse, ForgeBackupConfig } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetBackupConfigOptions } from "./types.ts";

/**
 * Get a specific backup configuration.
 */
export async function getBackupConfig(
  options: GetBackupConfigOptions,
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
