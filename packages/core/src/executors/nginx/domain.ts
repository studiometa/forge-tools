import {
  EnvironmentAttributesSchema,
  jsonApiDocumentSchema,
  unwrapDocument,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";
import { resolveDomainId } from "../domains/list.ts";

import type { GetDomainNginxConfigOptions, UpdateDomainNginxConfigOptions } from "./types.ts";

/**
 * Get the Nginx configuration for one domain of a site.
 * The domain is a domain record ID or a domain name.
 */
export async function getDomainNginxConfig(
  options: GetDomainNginxConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<string>> {
  const { server_id, site_id } = options;
  const domain_id = await resolveDomainId(server_id, site_id, options.domain, ctx);
  const response = await request(
    ROUTES.nginx.domainGet,
    ctx,
    { server_id, site_id, domain_id },
    { schema: jsonApiDocumentSchema(EnvironmentAttributesSchema) },
  );

  return {
    data: unwrapDocument(response).content,
  };
}

/**
 * Replace the Nginx configuration for one domain of a site.
 * The domain is a domain record ID or a domain name.
 */
export async function updateDomainNginxConfig(
  options: UpdateDomainNginxConfigOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<void>> {
  const { server_id, site_id } = options;
  const domain_id = await resolveDomainId(server_id, site_id, options.domain, ctx);
  await request(
    ROUTES.nginx.domainUpdate,
    ctx,
    { server_id, site_id, domain_id },
    { body: { config: options.content } },
  );

  return {
    data: undefined,
  };
}
