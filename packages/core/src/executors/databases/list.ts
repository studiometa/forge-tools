import type { DatabaseAttributes } from "@studiometa/forge-api";
import { DatabaseAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";

import type { ListDatabasesOptions } from "./types.ts";

/**
 * List databases on a server, from every page.
 */
export async function listDatabases(
  options: ListDatabasesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<DatabaseAttributes & { id: number }>>> {
  return {
    data: await listAllPages(
      ROUTES.databases.list,
      ctx,
      { server_id: options.server_id },
      DatabaseAttributesSchema,
    ),
  };
}
