import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { DeleteBackupConfigOptions } from "./types.ts";

/**
 * Delete a backup configuration.
 */
export async function deleteBackupConfig(
  options: DeleteBackupConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`${serverPath(options.server_id, ctx)}/database/backups/${options.id}`);

  return {
    data: undefined,
  };
}
