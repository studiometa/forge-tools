import type { JsonApiDocument, SiteAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { orgPrefix } from "../../utils/url-builder.ts";

import type { GetSiteOptions } from "./types.ts";

/**
 * Get a specific site by ID.
 *
 * Uses the org-scoped path `/orgs/{slug}/sites/{siteId}` — the v2 API
 * does not support GET on the server-scoped site path.
 */
export async function getSite(
  options: GetSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SiteAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<SiteAttributes>>(
    `${orgPrefix(ctx)}/sites/${options.site_id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
