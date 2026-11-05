/**
 * Smart resolution utilities for --server and --site options.
 *
 * Accepts numeric IDs (used as-is) or plain strings (resolved by name/partial match).
 * In exact mode (`--exact` or `FORGE_EXACT_MATCH=1`), a plain string must match a name exactly.
 */

import { listServers, listSites, matchByName } from "@studiometa/forge-core";
import type { CliExecutorContext } from "../context.ts";
import { ValidationError } from "../errors.ts";

interface NamedResource {
  id: number;
  name: string;
}

const EXACT_MATCH_HINT =
  "Pass the numeric ID or the exact name, or turn off exact matching: remove --exact and unset FORGE_EXACT_MATCH";

function formatResources(resources: NamedResource[]): string {
  return resources.map((r) => `  ${r.name} (${r.id})`).join("\n");
}

/**
 * Match a --server or --site value against a list of resources.
 *
 * - Numeric string → returned as-is
 * - Exact name (case-insensitive) → its ID
 * - Exact mode: no exact name → ValidationError listing the near (partial) matches
 * - Otherwise one partial match → its ID; 0 or 2+ partial matches → ValidationError
 */
function matchResourceId(
  value: string,
  resources: NamedResource[],
  kind: "server" | "site",
  scope: string,
  exactMatch: boolean,
): string {
  if (/^\d+$/.test(value)) {
    return value;
  }

  const { exact, partial } = matchByName(resources, value, (r) => r.name);

  if (exact.length === 1) {
    return String(exact[0].id);
  }

  if (exactMatch && exact.length === 0) {
    const candidates =
      partial.length > 0
        ? `Near matches:\n${formatResources(partial)}`
        : `Available ${kind}s:\n${formatResources(resources)}`;
    throw new ValidationError(`No ${kind} named "${value}"${scope} (exact match required)`, kind, [
      candidates,
      EXACT_MATCH_HINT,
    ]);
  }

  if (partial.length === 0) {
    throw new ValidationError(`No ${kind} found matching "${value}"${scope}`, kind, [
      `Available ${kind}s:\n${formatResources(resources)}`,
    ]);
  }

  if (partial.length > 1) {
    throw new ValidationError(
      `Ambiguous ${kind} name "${value}" — ${partial.length} matches found`,
      kind,
      [
        `Matching ${kind}s:\n${formatResources(partial)}`,
        "Use a more specific name or pass the numeric ID",
      ],
    );
  }

  return String(partial[0].id);
}

/**
 * Resolve a --server value to a numeric server ID string.
 *
 * - Numeric string → returned as-is (no API call)
 * - Plain string → fetch all servers, then see {@link matchServerId}
 */
export async function resolveServerId(value: string, execCtx: CliExecutorContext): Promise<string> {
  if (/^\d+$/.test(value)) {
    return value;
  }

  const result = await listServers({}, execCtx);
  return matchServerId(value, result.data, execCtx.exactMatch);
}

/**
 * Resolve a --server value to a numeric server ID string, against a list of servers
 * that is already loaded, with no API call.
 *
 * - Exact name match first, then a single partial match (unless `exactMatch`)
 *   - 0 matches → ValidationError listing available servers (near matches in exact mode)
 *   - 2+ matches → ValidationError listing ambiguous matches
 */
export function matchServerId(
  value: string,
  servers: NamedResource[],
  exactMatch: boolean,
): string {
  return matchResourceId(value, servers, "server", "", exactMatch);
}

/**
 * Resolve a --site value to a numeric site ID string.
 *
 * - Numeric string → returned as-is (no API call)
 * - Plain string → fetch all sites for the server, exact domain match first, then a single
 *   partial match (unless `execCtx.exactMatch`)
 *   - 0 matches → ValidationError listing available sites (near matches in exact mode)
 *   - 2+ matches → ValidationError listing ambiguous matches
 */
export async function resolveSiteId(
  value: string,
  serverId: string,
  execCtx: CliExecutorContext,
): Promise<string> {
  if (/^\d+$/.test(value)) {
    return value;
  }

  const result = await listSites({ server_id: serverId }, execCtx);
  return matchResourceId(value, result.data, "site", ` on server ${serverId}`, execCtx.exactMatch);
}
