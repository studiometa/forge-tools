import type { DatabaseUserAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DatabaseUserAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateDatabaseUserOptions } from "./types.ts";

/**
 * Create a new database user.
 */
export async function createDatabaseUser(
  options: CreateDatabaseUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DatabaseUserAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await request(
    ROUTES.databaseUsers.create,
    ctx,
    { server_id },
    { body: data, schema: jsonApiDocumentSchema(DatabaseUserAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
