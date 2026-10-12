import type { ServerAttributes } from "@studiometa/forge-api";
import { ServerAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";

import type { ListServersOptions } from "./types.ts";

/**
 * List all servers, from every page.
 */
export async function listServers(
  _options: ListServersOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<ServerAttributes & { id: number }>>> {
  return {
    data: await listAllPages(ROUTES.servers.list, ctx, {}, ServerAttributesSchema),
  };
}
