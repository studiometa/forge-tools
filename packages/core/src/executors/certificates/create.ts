import type {
  CertificateResponse,
  CreateCertificateData,
  ForgeCertificate,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Create a new SSL certificate.
 */
export async function createCertificate(
  options: { server_id: string; site_id: string } & CreateCertificateData,
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
  };
}
