import {
  unwrapDocument,
  jsonApiDocumentSchema,
  EnvironmentAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetNginxConfigOptions } from "./types.ts";

/**
 * Get Nginx configuration for a site.
 */
export async function getNginxConfig(
  options: GetNginxConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const response = await request(
    ROUTES.nginx.get,
    ctx,
    { server_id: options.server_id, site_id: options.site_id },
    { schema: jsonApiDocumentSchema(EnvironmentAttributesSchema) },
  );
  const result = unwrapDocument(response);

  return {
    data: result.content,
  };
}
