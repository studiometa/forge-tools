import type { BackgroundProcessAttributes } from "@studiometa/forge-api";
import { BackgroundProcessAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES } from "../../routes.ts";
import { listAllPages } from "../../utils/list-all-pages.ts";

import type { ListDaemonsOptions } from "./types.ts";

/**
 * List daemons on a server, from every page.
 * With `site_id`, list only the daemons that Forge associates with that site.
 */
export async function listDaemons(
  options: ListDaemonsOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<BackgroundProcessAttributes & { id: number }>>> {
  const query: Record<string, string> = options.site_id
    ? { "filter[site_id]": options.site_id }
    : {};

  return {
    data: await listAllPages(
      ROUTES.daemons.list,
      ctx,
      { server_id: options.server_id },
      BackgroundProcessAttributesSchema,
      query,
    ),
  };
}
