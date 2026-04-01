import type { DatabaseUserAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DatabaseUserAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateDatabaseUserOptions } from "./types.ts";

/**
 * Update an existing database user.
 */
export async function updateDatabaseUser(
  options: UpdateDatabaseUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DatabaseUserAttributes & { id: number }>> {
  const { server_id, id, ...data } = options;
  const response = await request(
    ROUTES.databaseUsers.update,
    ctx,
    { server_id, id },
    { body: data, schema: jsonApiDocumentSchema(DatabaseUserAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
