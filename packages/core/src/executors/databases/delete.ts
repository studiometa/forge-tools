import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { DeleteDatabaseOptions } from "./types.ts";

/**
 * Delete a database.
 */
export async function deleteDatabase(
  options: DeleteDatabaseOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`${serverPath(options.server_id, ctx)}/database/schemas/${options.id}`);

  return {
    data: undefined,
  };
}
