import type { JsonApiDocument, ServerAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { orgPrefix } from "../../utils/url-builder.ts";

import type { CreateServerOptions } from "./types.ts";

/**
 * Create a new server.
 */
export async function createServer(
  options: CreateServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ServerAttributes & { id: number }>> {
  const response = await ctx.client.post<JsonApiDocument<ServerAttributes>>(
    `${orgPrefix(ctx)}/servers`,
    options,
  );

  return {
    data: unwrapDocument(response),
  };
}
