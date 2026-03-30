import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { DeleteCertificateOptions } from "./types.ts";

/**
 * Delete the SSL certificate for a domain.
 */
export async function deleteCertificate(
  options: DeleteCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(
    `${sitePath(options.server_id, options.site_id, ctx)}/domains/${options.domain_id}/certificate`,
  );

  return {
    data: undefined,
  };
}
