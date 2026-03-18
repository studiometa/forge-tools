import type { JsonApiDocument, ScheduledJobAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateScheduledJobOptions } from "./types.ts";

/**
 * Create a new scheduled job (cron).
 */
export async function createScheduledJob(
  options: CreateScheduledJobOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ScheduledJobAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<ScheduledJobAttributes>>(
    `${serverPath(server_id, ctx)}/scheduled-jobs`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
