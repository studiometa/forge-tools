import type { ForgeRedirectRule, RedirectRuleResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetRedirectRuleOptions } from "./types.ts";

export async function getRedirectRule(
  options: GetRedirectRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRedirectRule>> {
  const response = await ctx.client.get<RedirectRuleResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/redirect-rules/${options.id}`,
  );
  const rule = response.redirect_rule;

  return {
    data: rule,
  };
}
