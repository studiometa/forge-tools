import * as v from "valibot";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { ImportRedirectRulesOptions } from "./types.ts";

const ImportResultSchema = v.object({ imported: v.number() });

/**
 * Import redirect rules from CSV (`from,to,type` header row). `append` adds them to the rules
 * of the site, `replace` replaces them. Returns the number of imported rules.
 */
export async function importRedirectRules(
  options: ImportRedirectRulesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<{ imported: number }>> {
  const form = new FormData();
  form.append("file", new Blob([options.csv], { type: "text/csv" }), "redirects.csv");
  form.append("mode", options.mode);

  const response = await request(
    ROUTES.redirectRules.import,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    { body: form, schema: ImportResultSchema },
  );

  return {
    data: response,
  };
}
