import type { CreateDatabaseData, DatabaseResponse, ForgeDatabase } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Create a new database.
 */
export async function createDatabase(
  options: { server_id: string } & CreateDatabaseData,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDatabase>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<DatabaseResponse>(`/servers/${server_id}/databases`, data);
  const db = response.database;

  return {
    data: db,
    text: `Database created: ${db.name} (ID: ${db.id})`,
  };
}
