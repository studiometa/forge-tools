import type { CertificateResponse, ForgeCertificate } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateCertificateOptions } from "./types.ts";

/**
 * Create a new SSL certificate.
 */
export async function createCertificate(
  options: CreateCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeCertificate>> {
  const { server_id, site_id, ...data } = options;
  const response = await ctx.client.post<CertificateResponse>(
    `/servers/${server_id}/sites/${site_id}/certificates`,
    data,
  );
  const cert = response.certificate;

  return {
    data: cert,
    text: `Certificate created: ${cert.domain} (ID: ${cert.id})`,
  };
}
