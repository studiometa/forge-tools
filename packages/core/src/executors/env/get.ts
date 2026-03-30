import type { JsonApiDocument } from "@studiometa/forge-api";
import { unwrapDocument } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetEnvOptions } from "./types.ts";

/**
 * Get environment variables for a site.
 */
export async function getEnv(
  options: GetEnvOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await request<JsonApiDocument<{ content: string }>>(ROUTES.env.get, ctx, {
    server_id: options.server_id,
    site_id: options.site_id,
  });
  const result = unwrapDocument(response);

  return {
    data: result.content,
  };
}
