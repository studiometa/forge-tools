import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeleteRedirectRuleOptions } from "./types.ts";

/**
 * Delete a redirect rule.
 */
export async function deleteRedirectRule(
  options: DeleteRedirectRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  await request(ROUTES.redirectRules.delete, ctx, {
    server_id: options.server_id,
    site_id: options.site_id,
    id: options.id,
  });

  return {
    data: undefined,
  };
}
