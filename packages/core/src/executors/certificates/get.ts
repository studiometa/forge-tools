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
 * Get the SSL certificate for a domain.
 */
export async function getCertificate(
  options: GetCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<CertificateAttributes & { id: number }>> {
  const response = await request(
    ROUTES.certificates.get,
    ctx,
    { server_id: options.server_id, site_id: options.site_id, domain_id: options.domain_id },
    { schema: jsonApiDocumentSchema(CertificateAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
