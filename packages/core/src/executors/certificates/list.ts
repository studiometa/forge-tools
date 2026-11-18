import type { CertificateAttributes } from "@studiometa/forge-api";

import * as v from "valibot";
import {
  unwrapResource,
  jsonApiResourceSchema,
  CertificateAttributesSchema,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListCertificatesOptions } from "./types.ts";

/** Forge lists certificates in one page, without pagination links. */
const CertificateListSchema = v.object({
  data: v.array(jsonApiResourceSchema(CertificateAttributesSchema)),
});

/**
 * List the SSL certificates of a domain, or of every domain of the site without `domain_id`.
 */
export async function listCertificates(
  options: ListCertificatesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<CertificateAttributes & { id: number }>>> {
  const { server_id, site_id, domain_id } = options;
  const response = await request(
    domain_id ? ROUTES.certificates.list : ROUTES.certificates.listForSite,
    ctx,
    { server_id, site_id, ...(domain_id ? { domain_id } : {}) },
    { schema: CertificateListSchema },
  );

  return {
    data: response.data.map(unwrapResource),
  };
}
