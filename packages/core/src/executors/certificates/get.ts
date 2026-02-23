import type { CertificateResponse, ForgeCertificate } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Get a single SSL certificate.
 */
export async function getCertificate(
  options: { server_id: string; site_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeCertificate>> {
  const response = await ctx.client.get<CertificateResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/certificates/${options.id}`,
  );
  const cert = response.certificate;

  return {
    data: cert,
    text: `Certificate: ${cert.domain} (ID: ${cert.id})\nType: ${cert.type}\nStatus: ${cert.status}\nActive: ${cert.active}`,
  };
}
