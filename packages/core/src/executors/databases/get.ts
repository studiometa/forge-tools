import type { DatabaseResponse, ForgeDatabase } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Get a single database.
 */
export async function getDatabase(
  options: { server_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDatabase>> {
  const response = await ctx.client.get<DatabaseResponse>(
    `/servers/${options.server_id}/databases/${options.id}`,
  );
  const db = response.database;

  return {
    data: db,
  };
}
