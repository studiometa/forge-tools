import type { JsonApiDocument, SecurityRuleAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { CreateSecurityRuleOptions } from "./types.ts";

export async function createSecurityRule(
  options: CreateSecurityRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SecurityRuleAttributes & { id: number }>> {
  const { server_id, site_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<SecurityRuleAttributes>>(
    `${sitePath(server_id, site_id, ctx)}/security-rules`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
