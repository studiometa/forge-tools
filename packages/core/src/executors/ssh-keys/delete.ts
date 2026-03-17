import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { DeleteSshKeyOptions } from "./types.ts";

export async function deleteSshKey(
  options: DeleteSshKeyOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`${serverPath(options.server_id, ctx)}/ssh-keys/${options.id}`);

  return {
    data: undefined,
  };
}
