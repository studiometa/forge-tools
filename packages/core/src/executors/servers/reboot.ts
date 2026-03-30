import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { RebootServerOptions } from "./types.ts";

/**
 * Reboot a server.
 */
export async function rebootServer(
  options: RebootServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.servers.reboot,
    ctx,
    { server_id: options.server_id },
    { body: { action: "reboot" } },
  );

  return {
    data: undefined,
  };
}
