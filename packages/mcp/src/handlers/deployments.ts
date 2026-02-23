import {
  deploySite,
  getDeploymentOutput,
  getDeploymentScript,
  listDeployments,
  updateDeploymentScript,
} from "@studiometa/forge-core";

import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

import { errorResult, jsonResult } from "./utils.ts";

/**
 * Handle deployment resource actions.
 */
export async function handleDeployments(
  action: string,
  args: CommonArgs,
  ctx: HandlerContext,
): Promise<ToolResult> {
  if (!args.server_id) return errorResult("Missing required field: server_id");
  if (!args.site_id) return errorResult("Missing required field: site_id");
  const serverId = Number(args.server_id);
  const siteId = Number(args.site_id);

  switch (action) {
    case "list": {
      const result = await listDeployments(
        { server_id: serverId, site_id: siteId },
        ctx.executorContext,
      );
      return jsonResult(result.text);
    }

    case "deploy": {
      const result = await deploySite(
        { server_id: serverId, site_id: siteId },
        ctx.executorContext,
      );
      return jsonResult(result.text);
    }

    case "get": {
      if (args.id) {
        const result = await getDeploymentOutput(
          { server_id: serverId, site_id: siteId, deployment_id: Number(args.id) },
          ctx.executorContext,
        );
        return jsonResult(result.text);
      }
      // Without ID, get the deployment script
      const result = await getDeploymentScript(
        { server_id: serverId, site_id: siteId },
        ctx.executorContext,
      );
      return jsonResult(result.text);
    }

    case "update": {
      if (!args.content) return errorResult("Missing required field: content");
      const result = await updateDeploymentScript(
        { server_id: serverId, site_id: siteId, content: args.content as string },
        ctx.executorContext,
      );
      return jsonResult(result.text);
    }

    default:
      return errorResult(
        `Unknown action "${action}" for deployments. Valid actions: list, deploy, get, update.`,
      );
  }
}
