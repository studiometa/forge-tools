import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { CreateCommandOptions } from "./types.ts";

/**
 * Execute a command on a site.
 */
export async function createCommand(
  options: CreateCommandOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(`${sitePath(options.server_id, options.site_id, ctx)}/commands`, {
    command: options.command,
  });

  return { data: undefined };
}
