import type { ForgeRedirectRule, RedirectRulesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListRedirectRulesOptions } from "./types.ts";

export async function listRedirectRules(
  options: ListRedirectRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRedirectRule[]>> {
  const response = await ctx.client.get<RedirectRulesResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/redirect-rules`,
  );
  const rules = response.redirect_rules;
  return {
    data: rules,
  };
}
