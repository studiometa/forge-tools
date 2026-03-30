import type { JsonApiDocument, BackupConfigAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { GetBackupConfigOptions } from "./types.ts";

/**
 * Get a specific backup configuration.
 */
export async function getBackupConfig(
  options: GetBackupConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<BackupConfigAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<BackupConfigAttributes>>(
    `${serverPath(options.server_id, ctx)}/database/backups/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
