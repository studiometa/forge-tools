import type { DatabasesResponse, ForgeDatabase } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListDatabasesOptions } from "./types.ts";

/**
 * List databases on a server.
 */
export async function listDatabases(
  options: ListDatabasesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeDatabase[]>> {
  const response = await ctx.client.get<DatabasesResponse>(
    `/servers/${options.server_id}/databases`,
  );
  const databases = response.databases;

  const lines = databases.map((d) => `• ${d.name} (ID: ${d.id}) — ${d.status}`);

  return {
    data: databases,
    text:
      databases.length > 0
        ? `${databases.length} database(s):\n${lines.join("\n")}`
        : "No databases found.",
  };
}
