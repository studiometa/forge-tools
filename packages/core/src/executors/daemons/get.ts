import type { JsonApiDocument, BackgroundProcessAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { GetDaemonOptions } from "./types.ts";

/**
 * Get a single daemon.
 */
export async function getDaemon(
  options: GetDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<BackgroundProcessAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<BackgroundProcessAttributes>>(
    `${serverPath(options.server_id, ctx)}/background-processes/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
