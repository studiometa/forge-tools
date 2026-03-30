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
  const response = await request(
    ROUTES.scheduledJobs.get,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(ScheduledJobAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
