import type { JsonApiDocument, DatabaseAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateDatabaseOptions } from "./types.ts";

/**
 * Create a new database.
 */
export async function createDatabase(
  options: CreateDatabaseOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DatabaseAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<DatabaseAttributes>>(
    `${serverPath(server_id, ctx)}/database/schemas`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
