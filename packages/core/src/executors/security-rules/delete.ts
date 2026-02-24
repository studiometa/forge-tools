import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeleteSecurityRuleOptions } from "./types.ts";

export async function deleteSecurityRule(
  options: DeleteSecurityRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(
    `/servers/${options.server_id}/sites/${options.site_id}/security-rules/${options.id}`,
  );

  return {
    data: undefined,
  };
}
