import {
  unwrapDocument,
  jsonApiDocumentSchema,
  OutputAttributesSchema,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetEventOptions } from "./types.ts";

/**
 * Get the output of an event of a server.
 */
export async function getEventOutput(
  options: GetEventOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await request(
    ROUTES.events.getOutput,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(OutputAttributesSchema) },
  );

  return {
    data: unwrapDocument(response).output,
  };
}
