import type { JsonApiListDocument, ServerAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { orgPrefix } from "../../utils/url-builder.ts";

import type { ListServersOptions } from "./types.ts";

/**
 * List all servers.
 */
export async function listServers(
  _options: ListServersOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<ServerAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<ServerAttributes>>(
    `${orgPrefix(ctx)}/servers`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
