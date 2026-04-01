import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteSecurityRuleOptions } from "./types.ts";

/**
 * Delete a security rule.
 */
export async function deleteSecurityRule(
  options: DeleteSecurityRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.securityRules.delete, ctx, {
    server_id: options.server_id,
    site_id: options.site_id,
    id: options.id,
  });

  return {
    data: undefined,
  };
}
