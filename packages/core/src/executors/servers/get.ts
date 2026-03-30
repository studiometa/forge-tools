import type { JsonApiDocument, ServerAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  ServerAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetServerOptions } from "./types.ts";

/**
 * Get a specific server by ID.
 */
export async function getServer(
  options: GetServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ServerAttributes & { id: number }>> {
  const response = await request<JsonApiDocument<ServerAttributes>>(
    ROUTES.servers.get,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiDocumentSchema(ServerAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
