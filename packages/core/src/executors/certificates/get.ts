import type { JsonApiDocument, CertificateAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetCertificateOptions } from "./types.ts";

/**
 * Get the SSL certificate for a domain.
 */
export async function getCertificate(
  options: GetCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<CertificateAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<CertificateAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/domains/${options.domain_id}/certificate`,
  );

  return {
    data: unwrapDocument(response),
  };
}
