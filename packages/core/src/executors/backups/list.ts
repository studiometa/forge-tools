import type { JsonApiListDocument, BackupConfigAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  BackupConfigAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListBackupConfigsOptions } from "./types.ts";

/**
 * List backup configurations for a server.
 */
export async function listBackupConfigs(
  options: ListBackupConfigsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<BackupConfigAttributes & { id: number }>>> {
  const response = await request<JsonApiListDocument<BackupConfigAttributes>>(
    ROUTES.backups.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(BackupConfigAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
