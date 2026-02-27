import type { SitesResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

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
  const lower = options.query.toLowerCase();

  // Exact match first
  const exact = sites.filter((s) => s.name.toLowerCase() === lower);
  if (exact.length === 1) {
    return {
      data: {
        query: options.query,
        matches: [{ id: exact[0]!.id, name: exact[0]!.name }],
        total: 1,
      },
    };
  }

  // Partial match
  const partial = sites.filter((s) => s.name.toLowerCase().includes(lower));
  return {
    data: {
      query: options.query,
      matches: partial.map((s) => ({ id: s.id, name: s.name })),
      total: partial.length,
    },
  };
}
