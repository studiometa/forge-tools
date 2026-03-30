import type { JsonApiDocument, SecurityRuleAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  SecurityRuleAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateSecurityRuleOptions } from "./types.ts";

/**
 * Create a security rule.
 */
export async function createSecurityRule(
  options: CreateSecurityRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<SecurityRuleAttributes & { id: number }>> {
  const { server_id, site_id, ...data } = options;
  const response = await request<JsonApiDocument<SecurityRuleAttributes>>(
    ROUTES.securityRules.create,
    ctx,
    { server_id, site_id },
    { body: data, schema: jsonApiDocumentSchema(SecurityRuleAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
