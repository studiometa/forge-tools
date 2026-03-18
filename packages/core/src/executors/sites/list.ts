import type { JsonApiListDocument, SiteAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { ListSitesOptions } from "./types.ts";

/**
 * List all sites on a server.
 */
export async function listSites(
  options: ListSitesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<SiteAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<SiteAttributes>>(
    `${serverPath(options.server_id, ctx)}/sites`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
