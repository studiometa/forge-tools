/**
 * Smart resolution utilities for --server and --site options.
 *
 * Accepts numeric IDs (used as-is) or plain strings (resolved by name/partial match).
 */

import { listServers, listSites } from "@studiometa/forge-core";
import type { ExecutorContext } from "@studiometa/forge-core";
import type { ForgeServer, ForgeSite } from "@studiometa/forge-api";
import { ValidationError } from "../errors.ts";

/**
 * Resolve a --server value to a numeric server ID string.
 *
 * - Numeric string → returned as-is (no API call)
 * - Plain string → fetch all servers, exact match first, then partial match
 *   - 0 matches → ValidationError listing available servers
 *   - 2+ matches → ValidationError listing ambiguous matches
 */
export async function resolveServerId(
  value: string,
  execCtx: ExecutorContext,
): Promise<string> {
  if (/^\d+$/.test(value)) {
    return value;
  }

  const result = await listServers({}, execCtx);
  const servers = result.data as ForgeServer[];

  const lower = value.toLowerCase();

  // Exact match by name
  const exact = servers.filter((s) => s.name.toLowerCase() === lower);
  if (exact.length === 1) {
    return String(exact[0].id);
  }

  // Partial match
  const partial = servers.filter((s) => s.name.toLowerCase().includes(lower));

  if (partial.length === 0) {
    const available = servers.map((s) => `  ${s.name} (${s.id})`).join("\n");
    throw new ValidationError(
      `No server found matching "${value}"`,
      "server",
      [`Available servers:\n${available}`],
    );
  }

  if (partial.length > 1) {
    const matches = partial.map((s) => `  ${s.name} (${s.id})`).join("\n");
    throw new ValidationError(
      `Ambiguous server name "${value}" — ${partial.length} matches found`,
      "server",
      [`Matching servers:\n${matches}`, "Use a more specific name or pass the numeric ID"],
    );
  }

  return String(partial[0].id);
}

/**
 * Resolve a --site value to a numeric site ID string.
 *
 * - Numeric string → returned as-is (no API call)
 * - Plain string → fetch all sites for the server, exact domain match first, then partial
 *   - 0 matches → ValidationError listing available sites
 *   - 2+ matches → ValidationError listing ambiguous matches
 */
export async function resolveSiteId(
  value: string,
  serverId: string,
  execCtx: ExecutorContext,
): Promise<string> {
  if (/^\d+$/.test(value)) {
    return value;
  }

  const result = await listSites({ server_id: serverId }, execCtx);
  const sites = result.data as ForgeSite[];

  const lower = value.toLowerCase();

  // Exact match by domain
  const exact = sites.filter((s) => s.name.toLowerCase() === lower);
  if (exact.length === 1) {
    return String(exact[0].id);
  }

  // Partial match
  const partial = sites.filter((s) => s.name.toLowerCase().includes(lower));

  if (partial.length === 0) {
    const available = sites.map((s) => `  ${s.name} (${s.id})`).join("\n");
    throw new ValidationError(
      `No site found matching "${value}" on server ${serverId}`,
      "site",
      [`Available sites:\n${available}`],
    );
  }

  if (partial.length > 1) {
    const matches = partial.map((s) => `  ${s.name} (${s.id})`).join("\n");
    throw new ValidationError(
      `Ambiguous site name "${value}" — ${partial.length} matches found`,
      "site",
      [`Matching sites:\n${matches}`, "Use a more specific name or pass the numeric ID"],
    );
  }

  return String(partial[0].id);
}
