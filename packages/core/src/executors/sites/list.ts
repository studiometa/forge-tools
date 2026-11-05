import type { SiteAttributes } from "@studiometa/forge-api";
import { SiteAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";

import type { ListSitesOptions } from "./types.ts";

/**
 * List all sites on a server, from every page.
 */
export async function listSites(
  options: ListSitesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<SiteAttributes & { id: number }>>> {
  return {
    data: await listAllPages(
      ROUTES.sites.list,
      ctx,
      { server_id: options.server_id },
      SiteAttributesSchema,
    ),
  };
}
