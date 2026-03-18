import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { DeleteServerOptions } from "./types.ts";

/**
 * Delete a server.
 */
export async function deleteServer(
  options: DeleteServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(serverPath(options.server_id, ctx));

  return {
    data: undefined,
  };
}
