import type { CertificatesResponse, ForgeCertificate } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListCertificatesOptions } from "./types.ts";

/**
 * List SSL certificates for a site.
 */
export async function listCertificates(
  options: ListCertificatesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeCertificate[]>> {
  const response = await ctx.client.get<CertificatesResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/certificates`,
  );
  const certificates = response.certificates;

  return {
    data: certificates,
  };
}
