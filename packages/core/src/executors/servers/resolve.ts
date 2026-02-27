import type { ServersResponse } from "@studiometa/forge-api";
import type { ExecutorContext, ExecutorResult } from "../../context.ts";

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
  const lower = options.query.toLowerCase();

  // Exact match first
  const exact = servers.filter((s) => s.name.toLowerCase() === lower);
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
  const partial = servers.filter((s) => s.name.toLowerCase().includes(lower));
  return {
    data: {
      query: options.query,
      matches: partial.map((s) => ({ id: s.id, name: s.name })),
      total: partial.length,
    },
  };
}
