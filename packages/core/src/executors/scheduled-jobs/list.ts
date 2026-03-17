import type { JsonApiListDocument, ScheduledJobAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { ListScheduledJobsOptions } from "./types.ts";

/**
 * List scheduled jobs (cron) on a server.
 */
export async function listScheduledJobs(
  options: ListScheduledJobsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<ScheduledJobAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<ScheduledJobAttributes>>(
    `${serverPath(options.server_id, ctx)}/scheduled-jobs`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
