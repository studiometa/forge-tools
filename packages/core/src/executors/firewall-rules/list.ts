import type { FirewallRuleAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  FirewallRuleAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ListFirewallRulesOptions } from "./types.ts";

/**
 * List firewall rules on a server.
 */
export async function listFirewallRules(
  options: ListFirewallRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<Array<FirewallRuleAttributes & { id: number }>>> {
  const response = await request(
    ROUTES.firewallRules.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(FirewallRuleAttributesSchema) },
  );

  return {
    data: unwrapListDocument(response),
  };
}
