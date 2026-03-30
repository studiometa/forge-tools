import type { JsonApiDocument, FirewallRuleAttributes } from "@studiometa/forge-api";
import {
  unwrapDocument,
  jsonApiDocumentSchema,
  FirewallRuleAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetFirewallRuleOptions } from "./types.ts";

/**
 * Get a single firewall rule.
 */
export async function getFirewallRule(
  options: GetFirewallRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<FirewallRuleAttributes & { id: number }>> {
  const response = await request<JsonApiDocument<FirewallRuleAttributes>>(
    ROUTES.firewallRules.get,
    ctx,
    { server_id: options.server_id, id: options.id },
    { schema: jsonApiDocumentSchema(FirewallRuleAttributesSchema) },
  );

  return {
    data: unwrapDocument(response),
  };
}
