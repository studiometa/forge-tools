import type { EventAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  EventAttributesSchema,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListEventsOptions } from "./types.ts";

/**
 * List the latest events (one page, newest first) of a server, or of the organization
 * without `server_id`.
 */
export async function listEvents(
  options: ListEventsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<EventAttributes & { id: number }>>> {
  const { server_id, initiated_by, ran_as } = options;
  const query: Record<string, string> = { sort: "-created_at" };
  if (initiated_by) query["filter[initiated_by]"] = initiated_by;
  if (ran_as) query["filter[ran_as]"] = ran_as;

  const response = await request(
    server_id ? ROUTES.events.listForServer : ROUTES.events.list,
    ctx,
    server_id ? { server_id } : {},
    { query, schema: jsonApiListDocumentSchema(EventAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
