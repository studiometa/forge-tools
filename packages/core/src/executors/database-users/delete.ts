import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { DeleteDatabaseUserOptions } from "./types.ts";

/**
 * Delete a database user.
 */
export async function deleteDatabaseUser(
  options: DeleteDatabaseUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`${serverPath(options.server_id, ctx)}/database/users/${options.id}`);

  return {
    data: undefined,
  };
}
