import type { DomainAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DomainAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateDomainOptions } from "./types.ts";

/**
 * Add a domain to a site. Forge adds it as an alias of the site.
 */
export async function createDomain(
  options: CreateDomainOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DomainAttributes & { id: number }>> {
  const { server_id, site_id, ...data } = options;
  const response = await request(
    ROUTES.domains.create,
    ctx,
    { server_id, site_id },
    { body: data, schema: jsonApiDocumentSchema(DomainAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
