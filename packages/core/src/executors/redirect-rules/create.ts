import type { ForgeRedirectRule, RedirectRuleResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateRedirectRuleOptions } from "./types.ts";

export async function createRedirectRule(
  options: CreateRedirectRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRedirectRule>> {
  const { server_id, site_id, ...data } = options;
  const response = await ctx.client.post<RedirectRuleResponse>(
    `/servers/${server_id}/sites/${site_id}/redirect-rules`,
    data,
  );
  const rule = response.redirect_rule;

  return {
    data: rule,
    text: `Redirect rule created: ${rule.from} → ${rule.to} (ID: ${rule.id})`,
  };
}
