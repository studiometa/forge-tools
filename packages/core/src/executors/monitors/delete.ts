import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { DeleteMonitorOptions } from "./types.ts";

export async function deleteMonitor(
  options: DeleteMonitorOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`${serverPath(options.server_id, ctx)}/monitors/${options.id}`);

  return {
    data: undefined,
  };
}
