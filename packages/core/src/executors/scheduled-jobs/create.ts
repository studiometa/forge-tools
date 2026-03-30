import type { JsonApiDocument, ScheduledJobAttributes } from "@studiometa/forge-api";
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
  const { server_id, ...data } = options;
  const response = await request<JsonApiDocument<ScheduledJobAttributes>>(
    ROUTES.scheduledJobs.create,
    ctx,
    { server_id },
    { body: data, schema: jsonApiDocumentSchema(ScheduledJobAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
