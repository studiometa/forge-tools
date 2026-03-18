import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateBackupConfigOptions } from "./types.ts";

/**
 * Create a new backup configuration.
 */
export async function createBackupConfig(
  options: CreateBackupConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, ...data } = options;
  await ctx.client.post(`${serverPath(server_id, ctx)}/database/backups`, data);

  return { data: undefined };
}
