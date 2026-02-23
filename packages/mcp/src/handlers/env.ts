import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

import { errorResult, jsonResult } from "./utils.ts";

/**
 * Handle environment variable actions.
 */
export async function handleEnv(
  action: string,
  args: CommonArgs,
  ctx: HandlerContext,
): Promise<ToolResult> {
  if (!args.server_id) return errorResult("Missing required field: server_id");
  if (!args.site_id) return errorResult("Missing required field: site_id");

  const path = `/servers/${args.server_id}/sites/${args.site_id}/env`;

  switch (action) {
    case "get": {
      const content = await ctx.executorContext.client.get<string>(path);
      return jsonResult(`Environment variables:\n${content}`);
    }

    case "update": {
      if (!args.content) return errorResult("Missing required field: content");
      await ctx.executorContext.client.put(path, { content: args.content as string });
      return jsonResult("Environment variables updated.");
    }

    default:
      return errorResult(`Unknown action "${action}" for env. Valid actions: get, update.`);
  }
}
