import type { CertificateResponse, ForgeCertificate } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetCertificateOptions } from "./types.ts";

/**
 * Get a single SSL certificate.
 */
export async function getCertificate(
  options: GetCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeCertificate>> {
  const response = await ctx.client.get<CertificateResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/certificates/${options.id}`,
  );
  const cert = response.certificate;

  return {
    data: cert,
  };
}
