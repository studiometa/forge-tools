import type { DatabaseUserAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  DatabaseUserAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListDatabaseUsersOptions } from "./types.ts";

/**
 * List database users on a server.
 */
export async function listDatabaseUsers(
  options: ListDatabaseUsersOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<DatabaseUserAttributes & { id: number }>>> {
  const response = await request(
    ROUTES.databaseUsers.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(DatabaseUserAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
