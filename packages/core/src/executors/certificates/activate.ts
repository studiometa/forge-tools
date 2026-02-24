import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ActivateCertificateOptions } from "./types.ts";

/**
 * Activate an SSL certificate.
 */
export async function activateCertificate(
  options: ActivateCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.post(
    `/servers/${options.server_id}/sites/${options.site_id}/certificates/${options.id}/activate`,
    {},
  );

  return {
    data: undefined,
  };
}
