import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteSshKeyOptions } from "./types.ts";

export async function deleteSshKey(
  options: DeleteSshKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/keys/${options.id}`);

  return {
    data: undefined,
  };
}
