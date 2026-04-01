import type { ScheduledJobAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  ScheduledJobAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetScheduledJobOptions } from "./types.ts";

/**
 * Get a specific scheduled job.
 */
export async function getScheduledJob(
  options: GetScheduledJobOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ScheduledJobAttributes & { id: number }>> {
  const route = options.site_id ? ROUTES.scheduledJobs.siteGet : ROUTES.scheduledJobs.get;
  const params: Record<string, string> = { server_id: options.server_id, id: options.id };
  if (options.site_id) params.site_id = options.site_id;

  const response = await request(route, ctx, params, {
    schema: jsonApiDocumentSchema(ScheduledJobAttributesSchema),
  });

  return {
    data: unwrapDocument(response),
  };
}
