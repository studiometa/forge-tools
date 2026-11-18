import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ReorderRedirectRulesOptions } from "./types.ts";

/**
 * Set the order of the redirect rules of a site: `redirects` lists every rule ID, in order.
 */
export async function reorderRedirectRules(
  options: ReorderRedirectRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, site_id, ...data } = options;
  await request(ROUTES.redirectRules.reorder, ctx, { server_id, site_id }, { body: data });

  return {
    data: undefined,
  };
}
