import type { JsonApiListDocument, CertificateAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { ListCertificatesOptions } from "./types.ts";

/**
 * List SSL certificates for a site.
 */
export async function listCertificates(
  options: ListCertificatesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<CertificateAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<CertificateAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/certificates`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
