import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { ActivateCertificateOptions } from "./types.ts";

/**
 * Activate the SSL certificate for a domain.
 */
export async function activateCertificate(
  options: ActivateCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(
    `${sitePath(options.server_id, options.site_id, ctx)}/domains/${options.domain_id}/certificate/actions`,
    { action: "activate" },
  );

  return {
    data: undefined,
  };
}
