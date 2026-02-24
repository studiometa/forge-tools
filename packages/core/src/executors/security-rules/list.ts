import type { ForgeSecurityRule, SecurityRulesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { ListSecurityRulesOptions } from "./types.ts";

export async function listSecurityRules(
  options: ListSecurityRulesOptions,
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
