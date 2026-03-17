import type { JsonApiDocument, MonitorAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { GetMonitorOptions } from "./types.ts";

export async function getMonitor(
  options: GetMonitorOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<MonitorAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<MonitorAttributes>>(
    `${serverPath(options.server_id, ctx)}/monitors/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
