import type { JsonApiDocument, BackgroundProcessAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateDaemonOptions } from "./types.ts";

/**
 * Create a new daemon (background process).
 */
export async function createDaemon(
  options: CreateDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<BackgroundProcessAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<BackgroundProcessAttributes>>(
    `${serverPath(server_id, ctx)}/background-processes`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
