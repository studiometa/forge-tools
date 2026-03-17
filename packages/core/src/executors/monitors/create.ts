import type { JsonApiDocument, MonitorAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateMonitorOptions } from "./types.ts";

export async function createMonitor(
  options: CreateMonitorOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<MonitorAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<MonitorAttributes>>(
    `${serverPath(server_id, ctx)}/monitors`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
