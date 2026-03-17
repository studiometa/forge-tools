import type { JsonApiDocument, RedirectRuleAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { CreateRedirectRuleOptions } from "./types.ts";

export async function createRedirectRule(
  options: CreateRedirectRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<RedirectRuleAttributes & { id: number }>> {
  const { server_id, site_id, ...data } = options;
  const response = await ctx.client.post<JsonApiDocument<RedirectRuleAttributes>>(
    `${sitePath(server_id, site_id, ctx)}/redirect-rules`,
    data,
  );

  return {
    data: unwrapDocument(response),
  };
}
