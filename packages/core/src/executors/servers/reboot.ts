import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { RebootServerOptions } from "./types.ts";

/**
 * Reboot a server.
 */
export async function rebootServer(
  options: RebootServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(`${serverPath(options.server_id, ctx)}/actions`, { action: "reboot" });

  return {
    data: undefined,
  };
}
