import type { SiteAttributes } from "@studiometa/forge-api";
import { unwrapDocument, jsonApiDocumentSchema, SiteAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateSiteOptions } from "./types.ts";

/**
 * Update an existing site on a server.
 */
export async function updateSite(
  options: UpdateSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SiteAttributes & { id: number }>> {
  const { server_id, site_id, ...data } = options;
  const response = await request(
    ROUTES.sites.update,
    ctx,
    { server_id, site_id },
    { body: data, schema: jsonApiDocumentSchema(SiteAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
