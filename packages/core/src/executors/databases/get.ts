import type { JsonApiDocument, DatabaseAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { GetDatabaseOptions } from "./types.ts";

/**
 * Get a single database.
 */
export async function getDatabase(
  options: GetDatabaseOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DatabaseAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<DatabaseAttributes>>(
    `${serverPath(options.server_id, ctx)}/database/schemas/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
