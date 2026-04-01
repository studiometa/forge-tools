import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { CreateRedirectRuleOptions } from "./types.ts";

/**
 * Create a redirect rule.
 */
export async function createRedirectRule(
  options: CreateRedirectRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, site_id, ...data } = options;
  await request(ROUTES.redirectRules.create, ctx, { server_id, site_id }, { body: data });

  return { data: undefined };
}
