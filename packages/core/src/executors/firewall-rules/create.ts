import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateFirewallRuleOptions } from "./types.ts";

export async function createFirewallRule(
  options: CreateFirewallRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, ...data } = options;
  await ctx.client.post(`${serverPath(server_id, ctx)}/firewall-rules`, data);

  return { data: undefined };
}
