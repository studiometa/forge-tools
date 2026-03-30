import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteDatabaseUserOptions } from "./types.ts";

/**
 * Delete a database user.
 */
export async function deleteDatabaseUser(
  options: DeleteDatabaseUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.databaseUsers.delete, ctx, { server_id: options.server_id, id: options.id });

  return {
    data: undefined,
  };
}
