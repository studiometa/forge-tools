import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteDatabaseUserOptions } from "./types.ts";

/**
 * Delete a database user.
 */
export async function deleteDatabaseUser(
  options: DeleteDatabaseUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/database-users/${options.id}`);

  return {
    data: undefined,
  };
}
