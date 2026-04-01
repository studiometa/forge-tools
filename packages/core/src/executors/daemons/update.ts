import type { BackgroundProcessAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  BackgroundProcessAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateDaemonOptions } from "./types.ts";

/**
 * Update an existing daemon.
 */
export async function updateDaemon(
  options: UpdateDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<BackgroundProcessAttributes & { id: number }>> {
  const { server_id, id, ...data } = options;
  const response = await request(
    ROUTES.daemons.update,
    ctx,
    { server_id, id },
    { body: data, schema: jsonApiDocumentSchema(BackgroundProcessAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
