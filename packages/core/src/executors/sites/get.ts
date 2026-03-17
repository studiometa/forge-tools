import type { JsonApiDocument, SiteAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetSiteOptions } from "./types.ts";

/**
 * Get a specific site by ID.
 */
export async function getSite(
  options: GetSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SiteAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<SiteAttributes>>(
    sitePath(options.server_id, options.site_id, ctx),
  );

  return {
    data: unwrapDocument(response),
  };
}
