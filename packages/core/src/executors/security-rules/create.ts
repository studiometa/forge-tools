import type { ForgeSecurityRule, SecurityRuleResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { CreateSecurityRuleOptions } from "./types.ts";

export async function createSecurityRule(
  options: CreateSecurityRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ForgeSecurityRule>> {
  const { server_id, site_id, ...data } = options;
  const response = await ctx.client.post<SecurityRuleResponse>(
    `/servers/${server_id}/sites/${site_id}/security-rules`,
    data,
  );
  const rule = response.security_rule;

  return {
    data: rule,
  };
}
