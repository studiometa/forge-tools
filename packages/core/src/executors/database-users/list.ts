import type { DatabaseUserAttributes } from "@studiometa/forge-api";
import { DatabaseUserAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";

import type { ListDatabaseUsersOptions } from "./types.ts";

/**
 * List database users on a server, from every page.
 */
export async function listDatabaseUsers(
  options: ListDatabaseUsersOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<DatabaseUserAttributes & { id: number }>>> {
  return {
    data: await listAllPages(
      ROUTES.databaseUsers.list,
      ctx,
      { server_id: options.server_id },
      DatabaseUserAttributesSchema,
    ),
  };
}
