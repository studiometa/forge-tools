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
    text: [
      `Backup Config: ${backup.provider_name} (ID: ${backup.id})`,
      `Frequency: ${backup.frequency}`,
      `Status: ${backup.status}`,
      `Retention: ${backup.retention} backups`,
      `Databases: ${backup.databases.map((d) => d.name).join(", ") || "none"}`,
      `Last backup: ${backup.last_backup_time ?? "never"}`,
    ].join("\n"),
  };
}
