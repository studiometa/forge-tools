import type { BackupConfigResponse, ForgeBackupConfig } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateBackupConfigOptions } from "./types.ts";

/**
 * Create a new backup configuration.
 */
export async function createBackupConfig(
  options: CreateBackupConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeBackupConfig>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<BackupConfigResponse>(
    `/servers/${server_id}/backup-configs`,
    data,
  );
  const backup = response.backup;

  return {
    data: backup,
  };
}
