import type { JsonApiDocument, SiteAttributes } from "@studiometa/forge-api";
import { unwrapDocument, jsonApiDocumentSchema, SiteAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

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
  const response = await request<JsonApiDocument<SiteAttributes>>(
    ROUTES.sites.get,
    ctx,
    { site_id: options.site_id },
    { schema: jsonApiDocumentSchema(SiteAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
