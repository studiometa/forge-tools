import type { JsonApiDocument, CertificateAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { CreateCertificateOptions } from "./types.ts";

/**
 * Create an SSL certificate for a domain.
 */
export async function createCertificate(
  options: CreateCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<CertificateAttributes & { id: number }>> {
  const { server_id, site_id, domain_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<CertificateAttributes>>(
    `${sitePath(server_id, site_id, ctx)}/domains/${domain_id}/certificate`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
