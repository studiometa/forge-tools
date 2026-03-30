import type { JsonApiDocument, MonitorAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  MonitorAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetMonitorOptions } from "./types.ts";

/**
 * Get a single monitor.
 */
export async function getMonitor(
  options: GetMonitorOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<MonitorAttributes & { id: number }>> {
  const response = await request<JsonApiDocument<MonitorAttributes>>(
    ROUTES.monitors.get,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(MonitorAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
