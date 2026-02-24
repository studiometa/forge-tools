import type { DatabaseUsersResponse, ForgeDatabaseUser } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListDatabaseUsersOptions } from "./types.ts";

/**
 * List database users on a server.
 */
export async function listDatabaseUsers(
  options: ListDatabaseUsersOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDatabaseUser[]>> {
  const response = await ctx.client.get<DatabaseUsersResponse>(
    `/servers/${options.server_id}/database-users`,
  );
  const users = response.users;

  return {
    data: users,
  };
}
