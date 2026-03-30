import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteBackupConfigOptions } from "./types.ts";

/**
 * Delete a backup configuration.
 */
export async function deleteBackupConfig(
  options: DeleteBackupConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.backups.delete, ctx, { server_id: options.server_id, id: options.id });

  return {
    data: undefined,
  };
}
