import type { ScheduledJobAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  ScheduledJobAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListScheduledJobsOptions } from "./types.ts";

/**
 * List scheduled jobs on a server.
 */
export async function listScheduledJobs(
  options: ListScheduledJobsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<ScheduledJobAttributes & { id: number }>>> {
  const route = options.site_id ? ROUTES.scheduledJobs.siteList : ROUTES.scheduledJobs.list;
  const params: Record<string, string> = { server_id: options.server_id };
  if (options.site_id) params.site_id = options.site_id;

  const response = await request(route, ctx, params, {
    schema: jsonApiListDocumentSchema(ScheduledJobAttributesSchema),
  });

  return {
    data: unwrapListDocument(response),
  };
}
