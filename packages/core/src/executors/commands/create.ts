import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateCommandOptions } from "./types.ts";

/**
 * Execute a command on a site.
 */
export async function createCommand(
  options: CreateCommandOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.commands.create,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    {
      body: { command: options.command },
    },
  );

  return { data: undefined };
}
