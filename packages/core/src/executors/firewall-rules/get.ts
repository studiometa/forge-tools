import type { JsonApiDocument, FirewallRuleAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { GetFirewallRuleOptions } from "./types.ts";

export async function getFirewallRule(
  options: GetFirewallRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<FirewallRuleAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<FirewallRuleAttributes>>(
    `${serverPath(options.server_id, ctx)}/firewall-rules/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
