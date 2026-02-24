import type { BackupConfigsResponse, ForgeBackupConfig } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListBackupConfigsOptions } from "./types.ts";

/**
 * List backup configurations for a server.
 */
export async function listBackupConfigs(
  options: ListBackupConfigsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeBackupConfig[]>> {
  const response = await ctx.client.get<BackupConfigsResponse>(
    `/servers/${options.server_id}/backup-configs`,
  );
  const backups = response.backups;

  return {
    data: backups,
  };
}
