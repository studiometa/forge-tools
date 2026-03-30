import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteSshKeyOptions } from "./types.ts";

/**
 * Delete an SSH key.
 */
export async function deleteSshKey(
  options: DeleteSshKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.sshKeys.delete, ctx, { server_id: options.server_id, id: options.id });

  return {
    data: undefined,
  };
}
