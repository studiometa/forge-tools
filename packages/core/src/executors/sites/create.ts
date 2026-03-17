import type { JsonApiDocument, SiteAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateSiteOptions } from "./types.ts";

/**
 * Create a new site on a server.
 */
export async function createSite(
  options: CreateSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SiteAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<SiteAttributes>>(
    `${serverPath(server_id, ctx)}/sites`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
