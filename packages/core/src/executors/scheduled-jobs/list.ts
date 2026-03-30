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
  const response = await request(
    ROUTES.scheduledJobs.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(ScheduledJobAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
