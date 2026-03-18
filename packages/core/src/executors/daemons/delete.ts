import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { DeleteDaemonOptions } from "./types.ts";

/**
 * Delete a daemon.
 */
export async function deleteDaemon(
  options: DeleteDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(
    `${serverPath(options.server_id, ctx)}/background-processes/${options.id}`,
  );

  return {
    data: undefined,
  };
}
