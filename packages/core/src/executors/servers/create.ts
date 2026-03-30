import type { JsonApiDocument, ServerAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  ServerAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateServerOptions } from "./types.ts";

/**
 * Create a new server.
 */
export async function createServer(
  options: CreateServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ServerAttributes & { id: number }>> {
  const response = await request<JsonApiDocument<ServerAttributes>>(
    ROUTES.servers.create,
    ctx,
    {},
    { body: options, schema: jsonApiDocumentSchema(ServerAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
