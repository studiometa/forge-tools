import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ExportRedirectRulesOptions } from "./types.ts";

/**
 * Export the redirect rules of a site as CSV, with a `from,to,type` header row.
 */
export async function exportRedirectRules(
  options: ExportRedirectRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const csv = await request<string>(ROUTES.redirectRules.export, ctx, {
    server_id: options.server_id,
    site_id: options.site_id,
  });

  return {
    data: csv,
  };
}
