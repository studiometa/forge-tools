import type { DatabaseUserResponse, ForgeDatabaseUser } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateDatabaseUserOptions } from "./types.ts";

/**
 * Create a new database user.
 */
export async function createDatabaseUser(
  options: CreateDatabaseUserOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDatabaseUser>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<DatabaseUserResponse>(
    `/servers/${server_id}/database-users`,
    data,
  );
  const user = response.user;

  return {
    data: user,
  };
}
