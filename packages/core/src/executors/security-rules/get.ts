import type { JsonApiDocument, SecurityRuleAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetSecurityRuleOptions } from "./types.ts";

export async function getSecurityRule(
  options: GetSecurityRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SecurityRuleAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<SecurityRuleAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/security-rules/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
