import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteCertificateOptions } from "./types.ts";

/**
 * Delete an SSL certificate of a domain.
 */
export async function deleteCertificate(
  options: DeleteCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.certificates.delete, ctx, {
    server_id: options.server_id,
    site_id: options.site_id,
    domain_id: options.domain_id,
    id: options.id,
  });

  return {
    data: undefined,
  };
}
