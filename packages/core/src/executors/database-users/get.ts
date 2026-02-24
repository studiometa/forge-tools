import type { DatabaseUserResponse, ForgeDatabaseUser } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetDatabaseUserOptions } from "./types.ts";

/**
 * Get a single database user.
 */
export async function getDatabaseUser(
  options: GetDatabaseUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDatabaseUser>> {
  const response = await ctx.client.get<DatabaseUserResponse>(
    `/servers/${options.server_id}/database-users/${options.id}`,
  );
  const user = response.user;

  return {
    data: user,
  };
}
