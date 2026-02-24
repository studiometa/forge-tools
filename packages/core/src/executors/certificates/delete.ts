import type { ExecutorContext, ExecutorResult } from "../../context.ts";

/**
 * Delete an SSL certificate.
 */
export async function deleteCertificate(
  options: { server_id: string; site_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(
    `/servers/${options.server_id}/sites/${options.site_id}/certificates/${options.id}`,
  );

  return {
    data: undefined,
  };
}
