import type { JsonApiDocument } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { sitePath } from "../../utils/url-builder.ts";

import type { GetNginxConfigOptions } from "./types.ts";

/**
 * Get Nginx configuration for a site.
 */
export async function getNginxConfig(
  options: GetNginxConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await ctx.client.get<JsonApiDocument<{ content: string }>>(
    `${sitePath(options.server_id, options.site_id, ctx)}/nginx`,
  );
  const result = unwrapDocument(response);

  return {
    data: result.content,
  };
}
