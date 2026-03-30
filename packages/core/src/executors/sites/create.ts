import type { SiteAttributes } from "@studiometa/forge-api";
import { unwrapDocument, jsonApiDocumentSchema, SiteAttributesSchema } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateSiteOptions } from "./types.ts";

/**
 * Create a new site on a server.
 */
export async function createSite(
  options: CreateSiteOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SiteAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await request(
    ROUTES.sites.create,
    ctx,
    { server_id },
    { body: data, schema: jsonApiDocumentSchema(SiteAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
