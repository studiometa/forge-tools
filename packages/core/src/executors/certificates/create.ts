import type { CertificateAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  CertificateAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateCertificateOptions } from "./types.ts";

/**
 * Create an SSL certificate for a domain.
 */
export async function createCertificate(
  options: CreateCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<CertificateAttributes & { id: number }>> {
  const { server_id, site_id, domain_id, ...data } = options;
  const response = await request(
    ROUTES.certificates.create,
    ctx,
    { server_id, site_id, domain_id },
    { body: data, schema: jsonApiDocumentSchema(CertificateAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
