import type { JsonApiDocument, DatabaseUserAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DatabaseUserAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetDatabaseUserOptions } from "./types.ts";

/**
 * Get a single database user.
 */
export async function getDatabaseUser(
  options: GetDatabaseUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DatabaseUserAttributes & { id: number }>> {
  const response = await request<JsonApiDocument<DatabaseUserAttributes>>(
    ROUTES.databaseUsers.get,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(DatabaseUserAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
