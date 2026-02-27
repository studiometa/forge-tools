import type { SitesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
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
 *
 * If exactly one site matches the query exactly, it is returned as a single result.
 * Otherwise all partial matches are returned.
 */
export async function resolveSites(
  options: ResolveSitesOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ResolveSiteResult>> {
  const response = await ctx.client.get<SitesResponse>(`/servers/${options.server_id}/sites`);
  const sites = response.sites;

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
