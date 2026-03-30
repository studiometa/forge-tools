import type { JsonApiListDocument, BackgroundProcessAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  BackgroundProcessAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListDaemonsOptions } from "./types.ts";

/**
 * List daemons on a server.
 */
export async function listDaemons(
  options: ListDaemonsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<BackgroundProcessAttributes & { id: number }>>> {
  const response = await request<JsonApiListDocument<BackgroundProcessAttributes>>(
    ROUTES.daemons.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(BackgroundProcessAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
