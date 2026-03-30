import type { JsonApiListDocument, BackgroundProcessAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { ListDaemonsOptions } from "./types.ts";

/**
 * List daemons (background processes) on a server.
 */
export async function listDaemons(
  options: ListDaemonsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<BackgroundProcessAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<BackgroundProcessAttributes>>(
    `${serverPath(options.server_id, ctx)}/background-processes`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
