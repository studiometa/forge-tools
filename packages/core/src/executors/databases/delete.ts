import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteDatabaseOptions } from "./types.ts";

/**
 * Delete a database.
 */
export async function deleteDatabase(
  options: DeleteDatabaseOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`/servers/${options.server_id}/databases/${options.id}`);

  return {
    data: undefined,
    text: `Database ${options.id} deleted.`,
  };
}
