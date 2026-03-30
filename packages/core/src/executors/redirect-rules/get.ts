import type { RedirectRuleAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  RedirectRuleAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetRedirectRuleOptions } from "./types.ts";

/**
 * Get a single redirect rule.
 */
export async function getRedirectRule(
  options: GetRedirectRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<RedirectRuleAttributes & { id: number }>> {
  const response = await request(
    ROUTES.redirectRules.get,
    ctx,
    { server_id: options.server_id, site_id: options.site_id, id: options.id },
    { schema: jsonApiDocumentSchema(RedirectRuleAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
