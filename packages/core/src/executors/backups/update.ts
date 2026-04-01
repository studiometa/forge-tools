import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateBackupConfigOptions } from "./types.ts";

/**
 * Update a backup configuration.
 */
export async function updateBackupConfig(
  options: UpdateBackupConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, id, ...data } = options;
  await request(ROUTES.backups.update, ctx, { server_id, id }, { body: data });

  return { data: undefined };
}
