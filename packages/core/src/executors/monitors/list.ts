import type { MonitorAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  MonitorAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListMonitorsOptions } from "./types.ts";

/**
 * List monitors on a server.
 */
export async function listMonitors(
  options: ListMonitorsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<MonitorAttributes & { id: number }>>> {
  const response = await request(
    ROUTES.monitors.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(MonitorAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
