import type { MonitorAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  MonitorAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateMonitorOptions } from "./types.ts";

/**
 * Create a monitor.
 */
export async function createMonitor(
  options: CreateMonitorOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<MonitorAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await request(
    ROUTES.monitors.create,
    ctx,
    { server_id },
    { body: data, schema: jsonApiDocumentSchema(MonitorAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
