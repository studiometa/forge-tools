import type { DatabaseResponse, ForgeDatabase } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateDatabaseOptions } from "./types.ts";

/**
 * Create a new database.
 */
export async function createDatabase(
  options: CreateDatabaseOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDatabase>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<DatabaseResponse>(`/servers/${server_id}/databases`, data);
  const db = response.database;

  return {
    data: db,
  };
}
