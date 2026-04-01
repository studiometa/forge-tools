import type { ScheduledJobAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  ScheduledJobAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateScheduledJobOptions } from "./types.ts";

/**
 * Create a scheduled job.
 */
export async function createScheduledJob(
  options: CreateScheduledJobOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ScheduledJobAttributes & { id: number }>> {
  const { server_id, site_id, ...data } = options;
  const route = site_id ? ROUTES.scheduledJobs.siteCreate : ROUTES.scheduledJobs.create;
  const params: Record<string, string> = { server_id };
  if (site_id) params.site_id = site_id;

  const response = await request(route, ctx, params, {
    body: data,
    schema: jsonApiDocumentSchema(ScheduledJobAttributesSchema),
  });

  return {
    data: unwrapDocument(response),
  };
}
