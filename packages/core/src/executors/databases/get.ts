import type { DatabaseResponse, ForgeDatabase } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetDatabaseOptions } from "./types.ts";

/**
 * Get a single database.
 */
export async function getDatabase(
  options: GetDatabaseOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDatabase>> {
  const response = await ctx.client.get<DatabaseResponse>(
    `/servers/${options.server_id}/databases/${options.id}`,
  );
  const db = response.database;

  return {
    data: db,
    text: `Database: ${db.name} (ID: ${db.id})\nStatus: ${db.status}\nCreated: ${db.created_at}`,
  };
}
