import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { CreateRedirectRuleOptions } from "./types.ts";

export async function createRedirectRule(
  options: CreateRedirectRuleOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, site_id, ...data } = options;
  await ctx.client.post(`${sitePath(server_id, site_id, ctx)}/redirect-rules`, data);

  return { data: undefined };
}
