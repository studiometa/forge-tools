import type { ExecutorContext } from "@studiometa/forge-core";
import { resolveServers, resolveSites } from "@studiometa/forge-core";
import type { CommonArgs } from "./types.ts";
import { errorResult } from "./utils.ts";
import type { ToolResult } from "./types.ts";

/**
 * Check if a value is a numeric ID.
 */
function isNumericId(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Result of auto-resolution. Either the args are updated with resolved IDs,
 * or an error result is returned.
 */
export type AutoResolveResult = { ok: true; args: CommonArgs } | { ok: false; error: ToolResult };

/**
 * Auto-resolve non-numeric server_id and site_id fields.
 *
 * Order matters: server_id is resolved first because site_id resolution
 * requires a numeric server_id.
 *
 * Skipped for the 'resolve' action itself (it IS the resolve action).
 */
export async function autoResolveIds(
  args: CommonArgs,
  executorContext: ExecutorContext,
): Promise<AutoResolveResult> {
  // Don't auto-resolve for the resolve action itself
  if (args.action === "resolve") {
    return { ok: true, args };
  }

  const resolved = { ...args };

  // Resolve server_id if non-numeric
  if (resolved.server_id && !isNumericId(resolved.server_id)) {
    const result = await resolveServers({ query: resolved.server_id }, executorContext);
    const { matches, total } = result.data;

    if (total === 0) {
      return {
        ok: false,
        error: errorResult(
          `No server matching "${resolved.server_id}". Use { resource: "servers", action: "resolve", query: "${resolved.server_id}" } to search.`,
        ),
      };
    }

    // Check for exact single match
    const exactMatch = matches.length === 1 && total === 1;
    if (!exactMatch && total > 1) {
      const matchList = matches.map((m) => `  • ${m.name} (ID: ${m.id})`).join("\n");
      return {
        ok: false,
        error: errorResult(
          `Ambiguous server name "${resolved.server_id}" — ${total} matches found:\n${matchList}\n\nUse a more specific name or pass the numeric ID.`,
        ),
      };
    }

    resolved.server_id = String(matches[0]!.id);
  }

  // Resolve site_id if non-numeric (requires resolved server_id)
  if (resolved.site_id && !isNumericId(resolved.site_id)) {
    if (!resolved.server_id) {
      return {
        ok: false,
        error: errorResult(
          "Cannot resolve site name without a server_id. Provide server_id first.",
        ),
      };
    }

    const result = await resolveSites(
      { server_id: resolved.server_id, query: resolved.site_id },
      executorContext,
    );
    const { matches, total } = result.data;

    if (total === 0) {
      return {
        ok: false,
        error: errorResult(
          `No site matching "${resolved.site_id}" on server ${resolved.server_id}. Use { resource: "sites", action: "resolve", server_id: "${resolved.server_id}", query: "${resolved.site_id}" } to search.`,
        ),
      };
    }

    if (total > 1) {
      const matchList = matches.map((m) => `  • ${m.name} (ID: ${m.id})`).join("\n");
      return {
        ok: false,
        error: errorResult(
          `Ambiguous site name "${resolved.site_id}" — ${total} matches found:\n${matchList}\n\nUse a more specific name or pass the numeric ID.`,
        ),
      };
    }

    resolved.site_id = String(matches[0]!.id);
  }

  return { ok: true, args: resolved };
}
