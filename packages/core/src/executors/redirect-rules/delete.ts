import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { DeleteRedirectRuleOptions } from "./types.ts";

export async function deleteRedirectRule(
  options: DeleteRedirectRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(
    `${sitePath(options.server_id, options.site_id, ctx)}/redirect-rules/${options.id}`,
  );

  return {
    data: undefined,
  };
}
