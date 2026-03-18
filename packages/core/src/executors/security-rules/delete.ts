import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { DeleteSecurityRuleOptions } from "./types.ts";

export async function deleteSecurityRule(
  options: DeleteSecurityRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(
    `${sitePath(options.server_id, options.site_id, ctx)}/security-rules/${options.id}`,
  );

  return {
    data: undefined,
  };
}
