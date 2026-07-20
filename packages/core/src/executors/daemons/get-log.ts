import {
  unwrapDocument,
  jsonApiDocumentSchema,
  BackgroundProcessLogAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetDaemonLogOptions } from "./types.ts";

/**
 * Get the log output for a daemon (background process).
 */
export async function getDaemonLog(
  options: GetDaemonLogOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await request(
    ROUTES.daemons.log,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(BackgroundProcessLogAttributesSchema) },
  );
  const result = unwrapDocument(response);

  return { data: result.content };
}
