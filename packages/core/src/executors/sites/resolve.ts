import type { JsonApiListDocument, SiteAttributes } from "@studiometa/forge-api";
import {
  unwrapListDocument,
  jsonApiListDocumentSchema,
  SiteAttributesSchema,
} from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";
import { matchByName } from "../../utils/name-matcher.ts";

export interface ResolveSitesOptions {
  server_id: string;
  query: string;
}

export interface ResolveSiteMatch {
  id: number;
  name: string;
}

export interface ResolveSiteResult {
  query: string;
  matches: ResolveSiteMatch[];
  total: number;
}

/**
 * Resolve sites by domain name — partial, case-insensitive match.
 */
export async function resolveSites(
  options: ResolveSitesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ResolveSiteResult>> {
  const response = await request<JsonApiListDocument<SiteAttributes>>(
    ROUTES.sites.list,
    ctx,
    { server_id: options.server_id },
    { schema: jsonApiListDocumentSchema(SiteAttributesSchema) },
  );
  const sites = unwrapListDocument(response);

  const match = matchByName(sites, options.query, (s) => s.name);
  const matches = match.exact.length === 1 ? match.exact : match.partial;

  return {
    data: {
      query: options.query,
      matches: matches.map((s) => ({ id: s.id, name: s.name })),
      total: matches.length,
    },
  };
}
