import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeactivateCertificateOptions } from "./types.ts";

/**
 * Deactivate an SSL certificate of a domain: Forge stops serving the domain with it.
 */
export async function deactivateCertificate(
  options: DeactivateCertificateOptions,
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
    { body: { action: "disable" } },
  );

  return {
    data: undefined,
  };
}
