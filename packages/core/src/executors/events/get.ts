import type { EventAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  EventAttributesSchema,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetEventOptions } from "./types.ts";

/**
 * Get an event of a server.
 */
export async function getEvent(
  options: GetEventOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<EventAttributes & { id: number }>> {
  const response = await request(
    ROUTES.events.get,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(EventAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
