import type { JsonApiDocument, BackupConfigAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateBackupConfigOptions } from "./types.ts";

/**
 * Create a new backup configuration.
 */
export async function createBackupConfig(
  options: CreateBackupConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<BackupConfigAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<BackupConfigAttributes>>(
    `${serverPath(server_id, ctx)}/database/backups`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
