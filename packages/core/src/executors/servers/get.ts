import type { JsonApiDocument, ServerAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { GetServerOptions } from "./types.ts";

/**
 * Get a specific server by ID.
 */
export async function getServer(
  options: GetServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ServerAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<ServerAttributes>>(
    serverPath(options.server_id, ctx),
  );

  return {
    data: unwrapDocument(response),
  };
}
