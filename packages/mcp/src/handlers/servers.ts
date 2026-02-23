import {
  createServer,
  deleteServer,
  getServer,
  listServers,
  rebootServer,
} from "@studiometa/forge-core";

import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

import { errorResult, jsonResult } from "./utils.ts";

/**
 * Handle server resource actions.
 */
export async function handleServers(
  action: string,
  args: CommonArgs,
  ctx: HandlerContext,
): Promise<ToolResult> {
  switch (action) {
    case "list": {
      const result = await listServers({} as Record<string, never>, ctx.executorContext);
      return jsonResult(result.text);
    }

    case "get": {
      if (!args.id) return errorResult("Missing required field: id");
      const result = await getServer({ server_id: Number(args.id) }, ctx.executorContext);
      return jsonResult(result.text);
    }

    case "create": {
      const result = await createServer(
        {
          provider: args.provider as string,
          credential_id: Number(args.credential_id),
          name: args.name as string,
          type: (args.type as string) ?? "app",
          size: args.size as string,
          region: args.region as string,
        },
        ctx.executorContext,
      );
      return jsonResult(result.text);
    }

    case "delete": {
      if (!args.id) return errorResult("Missing required field: id");
      const result = await deleteServer({ server_id: Number(args.id) }, ctx.executorContext);
      return jsonResult(result.text);
    }

    case "reboot": {
      if (!args.id) return errorResult("Missing required field: id");
      const result = await rebootServer({ server_id: Number(args.id) }, ctx.executorContext);
      return jsonResult(result.text);
    }

    default:
      return errorResult(
        `Unknown action "${action}" for servers. Valid actions: list, get, create, delete, reboot.`,
      );
  }
}
