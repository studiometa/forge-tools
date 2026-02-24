import type {
  BackupConfigResponse,
  CreateBackupConfigData,
  ForgeBackupConfig,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Create a new backup configuration.
 */
export async function createBackupConfig(
  options: { server_id: string } & CreateBackupConfigData,
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
    text: `Backup config created: ${backup.provider_name} (ID: ${backup.id})`,
  };
}
