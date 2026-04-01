import type { SecurityRuleAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  SecurityRuleAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetSecurityRuleOptions } from "./types.ts";

/**
 * Get a single security rule.
 */
export async function getSecurityRule(
  options: GetSecurityRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SecurityRuleAttributes & { id: number }>> {
  const response = await request(
    ROUTES.securityRules.get,
    ctx,
    { server_id: options.server_id, site_id: options.site_id, id: options.id },
    { schema: jsonApiDocumentSchema(SecurityRuleAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
