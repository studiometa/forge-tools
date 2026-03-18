import type { JsonApiListDocument, MonitorAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { ListMonitorsOptions } from "./types.ts";

export async function listMonitors(
  options: ListMonitorsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<MonitorAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<MonitorAttributes>>(
    `${serverPath(options.server_id, ctx)}/monitors`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
