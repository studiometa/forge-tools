import type { JsonApiDocument, DatabaseUserAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateDatabaseUserOptions } from "./types.ts";

/**
 * Create a new database user.
 */
export async function createDatabaseUser(
  options: CreateDatabaseUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DatabaseUserAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<DatabaseUserAttributes>>(
    `${serverPath(server_id, ctx)}/database/users`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
