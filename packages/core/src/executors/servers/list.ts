import type { ServerAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  ServerAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListServersOptions } from "./types.ts";

/**
 * List all servers.
 */
export async function listServers(
  _options: ListServersOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<ServerAttributes & { id: number }>>> {
  const response = await request(
    ROUTES.servers.list,
    ctx,
    {},
    { schema: jsonApiListDocumentSchema(ServerAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
