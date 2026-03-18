import type { JsonApiListDocument, DatabaseAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { ListDatabasesOptions } from "./types.ts";

/**
 * List databases on a server.
 */
export async function listDatabases(
  options: ListDatabasesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<DatabaseAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<DatabaseAttributes>>(
    `${serverPath(options.server_id, ctx)}/database/schemas`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
