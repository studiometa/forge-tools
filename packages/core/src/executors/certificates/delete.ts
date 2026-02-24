import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteCertificateOptions } from "./types.ts";

/**
 * Delete an SSL certificate.
 */
export async function deleteCertificate(
  options: DeleteCertificateOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(
    `/servers/${options.server_id}/sites/${options.site_id}/certificates/${options.id}`,
  );

  return {
    data: undefined,
    text: `Certificate ${options.id} deleted.`,
  };
}
