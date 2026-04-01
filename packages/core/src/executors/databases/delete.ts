import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteDatabaseOptions } from "./types.ts";

/**
 * Delete a database.
 */
export async function deleteDatabase(
  options: DeleteDatabaseOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.databases.delete, ctx, { server_id: options.server_id, id: options.id });

  return {
    data: undefined,
  };
}
