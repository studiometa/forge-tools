import type { BackupConfigAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  BackupConfigAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetBackupConfigOptions } from "./types.ts";

/**
 * Get a single backup configuration.
 */
export async function getBackupConfig(
  options: GetBackupConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<BackupConfigAttributes & { id: number }>> {
  const response = await request(
    ROUTES.backups.get,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(BackupConfigAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
