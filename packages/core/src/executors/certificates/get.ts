import type { CertificateAttributes } from "@studiometa/forge-api";

import {
  unwrapDocument,
  jsonApiDocumentSchema,
  CertificateAttributesSchema,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetCertificateOptions } from "./types.ts";

/**
 * Get an SSL certificate of a domain: the active one when no `id` is given.
 */
export async function getCertificate(
  options: GetCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<CertificateAttributes & { id: number }>> {
  const { server_id, site_id, domain_id, id } = options;
  const response = await request(
    id ? ROUTES.certificates.get : ROUTES.certificates.getActive,
    ctx,
    { server_id, site_id, domain_id, ...(id ? { id } : {}) },
    { schema: jsonApiDocumentSchema(CertificateAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
