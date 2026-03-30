import type { JsonApiDocument, RedirectRuleAttributes } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetRedirectRuleOptions } from "./types.ts";

export async function getRedirectRule(
  options: GetRedirectRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<RedirectRuleAttributes & { id: number }>> {
  const response = await ctx.client.get<JsonApiDocument<RedirectRuleAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/redirect-rules/${options.id}`,
  );

  return {
    data: unwrapDocument(response),
  };
}
