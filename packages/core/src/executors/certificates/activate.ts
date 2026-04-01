import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ActivateCertificateOptions } from "./types.ts";

/**
 * Activate the SSL certificate for a domain.
 */
export async function activateCertificate(
  options: ActivateCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.certificates.activate,
    ctx,
    { server_id: options.server_id, site_id: options.site_id, domain_id: options.domain_id },
    { body: { action: "activate" } },
  );

  return {
    data: undefined,
  };
}
