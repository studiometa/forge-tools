import type { ForgeRedirectRule, RedirectRuleResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function getRedirectRule(
  options: { server_id: string; site_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRedirectRule>> {
  const response = await ctx.client.get<RedirectRuleResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/redirect-rules/${options.id}`,
  );
  const rule = response.redirect_rule;

  return {
    data: rule,
    text: `Redirect Rule: ${rule.from} → ${rule.to} (ID: ${rule.id})\nType: ${rule.type}`,
  };
}
