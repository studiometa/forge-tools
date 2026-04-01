import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteServerOptions } from "./types.ts";

/**
 * Delete a server.
 */
export async function deleteServer(
  options: DeleteServerOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.servers.delete, ctx, { server_id: options.server_id });

  return {
    data: undefined,
  };
}
