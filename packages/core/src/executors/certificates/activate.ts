import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ActivateCertificateOptions } from "./types.ts";

/**
 * Activate an SSL certificate of a domain: Forge serves the domain with it.
 */
export async function activateCertificate(
  options: ActivateCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(
    ROUTES.certificates.action,
    ctx,
    {
      server_id: options.server_id,
      site_id: options.site_id,
      domain_id: options.domain_id,
      id: options.id,
    },
    { body: { action: "enable" } },
  );

  return {
    data: undefined,
  };
}
