import type { ForgeSecurityRule, SecurityRuleResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function getSecurityRule(
  options: { server_id: string; site_id: string; id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSecurityRule>> {
  const response = await ctx.client.get<SecurityRuleResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/security-rules/${options.id}`,
  );
  const rule = response.security_rule;

  return {
    data: rule,
    text: `Security Rule: ${rule.name} (ID: ${rule.id})\nPath: ${rule.path ?? "/"}`,
  };
}
