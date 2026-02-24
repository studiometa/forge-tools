import type { ForgeSecurityRule, SecurityRulesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

export async function listSecurityRules(
  options: { server_id: string; site_id: string },
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSecurityRule[]>> {
  const response = await ctx.client.get<SecurityRulesResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/security-rules`,
  );
  const rules = response.security_rules;

  return {
    data: rules,
  };
}
