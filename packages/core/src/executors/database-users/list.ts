import type { JsonApiListDocument, DatabaseUserAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { ListDatabaseUsersOptions } from "./types.ts";

/**
 * List database users on a server.
 */
export async function listDatabaseUsers(
  options: ListDatabaseUsersOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<DatabaseUserAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<DatabaseUserAttributes>>(
    `${serverPath(options.server_id, ctx)}/database/users`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
