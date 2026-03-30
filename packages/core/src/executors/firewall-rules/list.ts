import type { JsonApiListDocument, FirewallRuleAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { serverPath } from "../../utils/url-builder.ts";

import type { ListFirewallRulesOptions } from "./types.ts";

export async function listFirewallRules(
  options: ListFirewallRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<FirewallRuleAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<FirewallRuleAttributes>>(
    `${serverPath(options.server_id, ctx)}/firewall-rules`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
