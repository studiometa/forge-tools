import type { JsonApiDocument, CertificateAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetCertificateOptions } from "./types.ts";

/**
 * Get a single SSL certificate.
 */
export async function getCertificate(
  options: GetCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<CertificateAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<CertificateAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/certificates/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
