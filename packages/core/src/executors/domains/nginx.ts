import {
  EnvironmentAttributesSchema,
  jsonApiDocumentSchema,
  unwrapDocument,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { GetDomainNginxConfigOptions } from "./types.ts";

/**
 * Get the Nginx configuration of a domain. Each domain of a site created since October 2025 has
 * its own file; the domains of an older site have none, and the content is then empty.
 */
export async function getDomainNginxConfig(
  options: GetDomainNginxConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const { server_id, site_id, domain_id } = options;
  const response = await request(
    ROUTES.domains.nginx,
    ctx,
    { server_id, site_id, domain_id },
    { schema: jsonApiDocumentSchema(EnvironmentAttributesSchema) },
  );

  return {
    data: unwrapDocument(response).content,
  };
}
