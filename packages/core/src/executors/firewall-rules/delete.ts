import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { DeleteFirewallRuleOptions } from "./types.ts";

export async function deleteFirewallRule(
  options: DeleteFirewallRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await ctx.client.delete(`${serverPath(options.server_id, ctx)}/firewall-rules/${options.id}`);

  return {
    data: undefined,
  };
}
