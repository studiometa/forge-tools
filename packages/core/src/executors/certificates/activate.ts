import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { ActivateCertificateOptions } from "./types.ts";

/**
 * Activate an SSL certificate.
 */
export async function activateCertificate(
  options: ActivateCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(
    `${sitePath(options.server_id, options.site_id, ctx)}/certificates/${options.id}/activate`,
    {},
  );

  return {
    data: undefined,
  };
}
