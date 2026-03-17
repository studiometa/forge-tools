import type { JsonApiDocument, FirewallRuleAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { CreateFirewallRuleOptions } from "./types.ts";

export async function createFirewallRule(
  options: CreateFirewallRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<FirewallRuleAttributes & { id: number }>> {
  const { server_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<FirewallRuleAttributes>>(
    `${serverPath(server_id, ctx)}/firewall-rules`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
