import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateBackupConfigOptions } from "./types.ts";

/**
 * Create a backup configuration.
 */
export async function createBackupConfig(
  options: CreateBackupConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, ...data } = options;
  await request(ROUTES.backups.create, ctx, { server_id }, { body: data });

  return { data: undefined };
}
