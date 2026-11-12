import type { DomainAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DomainAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateDomainOptions } from "./types.ts";

/**
 * Update a domain of a site, e.g. its `www` redirect.
 */
export async function updateDomain(
  options: UpdateDomainOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DomainAttributes & { id: number }>> {
  const { server_id, site_id, domain_id, ...data } = options;
  const response = await request(
    ROUTES.domains.update,
    ctx,
    { server_id, site_id, domain_id },
    { body: data, schema: jsonApiDocumentSchema(DomainAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
