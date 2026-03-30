import type { JsonApiListDocument, BackupConfigAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { ListBackupConfigsOptions } from "./types.ts";

/**
 * List backup configurations for a server.
 */
export async function listBackupConfigs(
  options: ListBackupConfigsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<BackupConfigAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<BackupConfigAttributes>>(
    `${serverPath(options.server_id, ctx)}/database/backups`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
