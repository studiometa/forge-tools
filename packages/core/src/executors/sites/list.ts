import type { JsonApiListDocument, SiteAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  SiteAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListSitesOptions } from "./types.ts";

/**
 * List all sites on a server.
 */
export async function listSites(
  options: ListSitesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<SiteAttributes & { id: number }>>> {
  const response = await request<JsonApiListDocument<SiteAttributes>>(
    ROUTES.sites.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(SiteAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
