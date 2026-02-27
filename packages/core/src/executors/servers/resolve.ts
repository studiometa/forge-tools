import type { ServersResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { matchByName } from "../../utils/name-matcher.ts";

export interface ResolveServersOptions {
  query: string;
}

export interface ResolveMatch {
  id: number;
  name: string;
}

export interface ResolveResult {
  query: string;
  matches: ResolveMatch[];
  total: number;
}

/**
 * Resolve servers by name — partial, case-insensitive match.
 *
 * If exactly one server matches the query exactly, it is returned as a single result.
 * Otherwise all partial matches are returned.
 */
export async function resolveServers(
  options: ResolveServersOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<ResolveResult>> {
  const response = await ctx.client.get<ServersResponse>("/servers");
  const servers = response.servers;

  const match = matchByName(servers, options.query, (s) => s.name);
  const matches = match.exact.length === 1 ? match.exact : match.partial;

  return {
    data: {
      query: options.query,
      matches: matches.map((s) => ({ id: s.id, name: s.name })),
      total: matches.length,
    },
  };
}
