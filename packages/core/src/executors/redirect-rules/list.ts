import type { JsonApiListDocument, RedirectRuleAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  RedirectRuleAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListRedirectRulesOptions } from "./types.ts";

/**
 * List redirect rules for a site.
 */
export async function listRedirectRules(
  options: ListRedirectRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<RedirectRuleAttributes & { id: number }>>> {
  const response = await request<JsonApiListDocument<RedirectRuleAttributes>>(
    ROUTES.redirectRules.list,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    { schema: jsonApiListDocumentSchema(RedirectRuleAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
