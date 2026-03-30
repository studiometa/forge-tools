import type { BackgroundProcessAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  BackgroundProcessAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetDaemonOptions } from "./types.ts";

/**
 * Get a single daemon.
 */
export async function getDaemon(
  options: GetDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<BackgroundProcessAttributes & { id: number }>> {
  const response = await request(
    ROUTES.daemons.get,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(BackgroundProcessAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
