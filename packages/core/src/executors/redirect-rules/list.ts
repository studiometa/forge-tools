import type { ForgeRedirectRule, RedirectRulesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function listRedirectRules(
  options: { server_id: string; site_id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeRedirectRule[]>> {
  const response = await ctx.client.get<RedirectRulesResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/redirect-rules`,
  );
  const rules = response.redirect_rules;
  const lines = rules.map((r) => `• ${r.from} → ${r.to} (ID: ${r.id}) — ${r.type}`);

  return {
    data: rules,
    text:
      rules.length > 0
        ? `${rules.length} redirect rule(s):\n${lines.join("\n")}`
        : "No redirect rules found.",
  };
}
