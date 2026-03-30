import type { BackgroundProcessAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  BackgroundProcessAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateDaemonOptions } from "./types.ts";

/**
 * Create a new daemon.
 */
export async function createDaemon(
  options: CreateDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<BackgroundProcessAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await request(
    ROUTES.daemons.create,
    ctx,
    { server_id },
    { body: data, schema: jsonApiDocumentSchema(BackgroundProcessAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
