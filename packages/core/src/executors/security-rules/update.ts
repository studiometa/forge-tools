import type { SecurityRuleAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  SecurityRuleAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { UpdateSecurityRuleOptions } from "./types.ts";

/**
 * Update a security rule.
 */
export async function updateSecurityRule(
  options: UpdateSecurityRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SecurityRuleAttributes & { id: number }>> {
  const { server_id, site_id, id, ...data } = options;
  const response = await request(
    ROUTES.securityRules.update,
    ctx,
    { server_id, site_id, id },
    { body: data, schema: jsonApiDocumentSchema(SecurityRuleAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
