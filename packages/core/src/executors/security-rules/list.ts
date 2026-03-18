import type { JsonApiListDocument, SecurityRuleAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { ListSecurityRulesOptions } from "./types.ts";

export async function listSecurityRules(
  options: ListSecurityRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<SecurityRuleAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<SecurityRuleAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/security-rules`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
