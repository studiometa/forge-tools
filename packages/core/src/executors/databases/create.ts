import type { JsonApiDocument, DatabaseAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DatabaseAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateDatabaseOptions } from "./types.ts";

/**
 * Create a new database.
 */
export async function createDatabase(
  options: CreateDatabaseOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DatabaseAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await request<JsonApiDocument<DatabaseAttributes>>(
    ROUTES.databases.create,
    ctx,
    { server_id },
    { body: data, schema: jsonApiDocumentSchema(DatabaseAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
