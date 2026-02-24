import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteRedirectRuleOptions } from "./types.ts";

export async function deleteRedirectRule(
  options: DeleteRedirectRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(
    `/servers/${options.server_id}/sites/${options.site_id}/redirect-rules/${options.id}`,
  );

  return {
    data: undefined,
  };
}
