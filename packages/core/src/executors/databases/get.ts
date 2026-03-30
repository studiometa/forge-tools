import type { JsonApiDocument, DatabaseAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DatabaseAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetDatabaseOptions } from "./types.ts";

/**
 * Get a single database.
 */
export async function getDatabase(
  options: GetDatabaseOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DatabaseAttributes & { id: number }>> {
  const response = await request<JsonApiDocument<DatabaseAttributes>>(
    ROUTES.databases.get,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(DatabaseAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
