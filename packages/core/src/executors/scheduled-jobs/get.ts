import type { JsonApiDocument, ScheduledJobAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { GetScheduledJobOptions } from "./types.ts";

/**
 * Get a specific scheduled job.
 */
export async function getScheduledJob(
  options: GetScheduledJobOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ScheduledJobAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<ScheduledJobAttributes>>(
    `${serverPath(options.server_id, ctx)}/scheduled-jobs/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
