import type { ServerAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  ServerAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateServerOptions } from "./types.ts";

/**
 * Update a server: its name, IP addresses, timezone or tags.
 */
export async function updateServer(
  options: UpdateServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ServerAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await request(
    ROUTES.servers.update,
    ctx,
    { server_id },
    { body: data, schema: jsonApiDocumentSchema(ServerAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
