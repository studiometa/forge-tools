import type { JsonApiListDocument, DatabaseAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  DatabaseAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListDatabasesOptions } from "./types.ts";

/**
 * List databases on a server.
 */
export async function listDatabases(
  options: ListDatabasesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<DatabaseAttributes & { id: number }>>> {
  const response = await request<JsonApiListDocument<DatabaseAttributes>>(
    ROUTES.databases.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(DatabaseAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
