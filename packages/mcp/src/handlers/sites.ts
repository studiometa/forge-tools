import { createSite, deleteSite, getSite, listSites } from "@studiometa/forge-core";

import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

import { errorResult, jsonResult } from "./utils.ts";

/**
 * Handle site resource actions.
 */
export async function handleSites(
  action: string,
  args: CommonArgs,
  ctx: HandlerContext,
): Promise<ToolResult> {
  if (!args.server_id) return errorResult("Missing required field: server_id");
  const serverId = Number(args.server_id);

  switch (action) {
    case "list": {
      const result = await listSites({ server_id: serverId }, ctx.executorContext);
      return jsonResult(result.text);
    }

    case "get": {
      if (!args.id) return errorResult("Missing required field: id");
      const result = await getSite(
        { server_id: serverId, site_id: Number(args.id) },
        ctx.executorContext,
      );
      return jsonResult(result.text);
    }

    case "create": {
      if (!args.domain) return errorResult("Missing required field: domain");
      const result = await createSite(
        {
          server_id: serverId,
          domain: args.domain as string,
          project_type: (args.project_type as string) ?? "php",
          directory: args.directory as string | undefined,
        },
        ctx.executorContext,
      );
      return jsonResult(result.text);
    }

    case "delete": {
      if (!args.id) return errorResult("Missing required field: id");
      const result = await deleteSite(
        { server_id: serverId, site_id: Number(args.id) },
        ctx.executorContext,
      );
      return jsonResult(result.text);
    }

    default:
      return errorResult(
        `Unknown action "${action}" for sites. Valid actions: list, get, create, delete.`,
      );
  }
}
