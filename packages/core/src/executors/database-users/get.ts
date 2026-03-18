import type { JsonApiDocument, DatabaseUserAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { GetDatabaseUserOptions } from "./types.ts";

/**
 * Get a single database user.
 */
export async function getDatabaseUser(
  options: GetDatabaseUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DatabaseUserAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<DatabaseUserAttributes>>(
    `${serverPath(options.server_id, ctx)}/database/users/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
