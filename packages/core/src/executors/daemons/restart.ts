import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { RestartDaemonOptions } from "./types.ts";

/**
 * Restart a daemon.
 */
export async function restartDaemon(
  options: RestartDaemonOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(
    `${serverPath(options.server_id, ctx)}/background-processes/${options.id}/restart`,
    {},
  );

  return {
    data: undefined,
  };
}
