import type { ForgeSecurityRule, SecurityRuleResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { GetSecurityRuleOptions } from "./types.ts";

export async function getSecurityRule(
  options: GetSecurityRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSecurityRule>> {
  const response = await ctx.client.get<SecurityRuleResponse>(
    `/servers/${options.server_id}/sites/${options.site_id}/security-rules/${options.id}`,
  );
  const rule = response.security_rule;

  return {
    data: rule,
  };
}
