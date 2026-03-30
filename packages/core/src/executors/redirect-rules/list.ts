import type { JsonApiListDocument, RedirectRuleAttributes } from "@studiometa/forge-api";
import { unwrapListDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { ListRedirectRulesOptions } from "./types.ts";

export async function listRedirectRules(
  options: ListRedirectRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<RedirectRuleAttributes & { id: number }>>> {
  const response = await ctx.client.get<JsonApiListDocument<RedirectRuleAttributes>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/redirect-rules`,
  );

  return {
    data: unwrapListDocument(response),
  };
}
