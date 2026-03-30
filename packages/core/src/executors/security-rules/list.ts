import type { SecurityRuleAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  SecurityRuleAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListSecurityRulesOptions } from "./types.ts";

/**
 * List security rules for a site.
 */
export async function listSecurityRules(
  options: ListSecurityRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<SecurityRuleAttributes & { id: number }>>> {
  const response = await request(
    ROUTES.securityRules.list,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    { schema: jsonApiListDocumentSchema(SecurityRuleAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
