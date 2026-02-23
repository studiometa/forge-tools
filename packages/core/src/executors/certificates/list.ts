import type { CertificatesResponse, ForgeCertificate } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * List SSL certificates for a site.
 */
export async function listCertificates(
  options: { server_id: string; site_id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeCertificate[]>> {
  const response = await ctx.client.get<CertificatesResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/certificates`,
  );
  const certificates = response.certificates;

  const lines = certificates.map(
    (c) =>
      `• ${c.domain} (ID: ${c.id}) — ${c.type} — ${c.active ? "active" : "inactive"} — ${c.status}`,
  );

  return {
    data: certificates,
    text:
      certificates.length > 0
        ? `${certificates.length} certificate(s):\n${lines.join("\n")}`
        : "No certificates found.",
  };
}
