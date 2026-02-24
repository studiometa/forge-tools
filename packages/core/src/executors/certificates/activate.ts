import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Activate an SSL certificate.
 */
export async function activateCertificate(
  options: { server_id: string; site_id: string; id: string },
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
