import {
  deploySite,
  getDeploymentOutput,
  getDeploymentScript,
  listDeployments,
  updateDeploymentScript,
} from "@studiometa/forge-core";

import type { ForgeDeployment } from "@studiometa/forge-api";

import {
  formatDeploymentList,
  formatDeploymentOutput,
  formatDeploymentScript,
  formatDeploymentScriptUpdated,
  formatDeployAction,
} from "../formatters.ts";
import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

import { errorResult, jsonResult, sanitizeId } from "./utils.ts";

/**
 * Handle deployment resource actions.
 *
 * Not using the factory because the `get` action has special logic
 * (with id → output, without id → script).
 */
export async function handleDeployments(
  action: string,
  args: CommonArgs,
  ctx: HandlerContext,
): Promise<ToolResult> {
  if (!args.server_id) return errorResult("Missing required field: server_id");
  if (!args.site_id) return errorResult("Missing required field: site_id");

  // Validate IDs to prevent path traversal
  if (!sanitizeId(args.server_id)) {
    return errorResult(`Invalid server_id: "${args.server_id}". IDs must be alphanumeric.`);
  }
  if (!sanitizeId(args.site_id)) {
    return errorResult(`Invalid site_id: "${args.site_id}". IDs must be alphanumeric.`);
  }
  if (args.id && !sanitizeId(args.id)) {
    return errorResult(`Invalid id: "${args.id}". IDs must be alphanumeric.`);
  }

  const opts = { server_id: args.server_id, site_id: args.site_id };

  switch (action) {
    case "list": {
      const result = await listDeployments(opts, ctx.executorContext);
      if (ctx.compact) {
        return jsonResult(formatDeploymentList(result.data as ForgeDeployment[]));
      }
      return jsonResult(result.data);
    }

    case "deploy": {
      await deploySite(opts, ctx.executorContext);
      return jsonResult(formatDeployAction(args.site_id, args.server_id));
    }

    case "get": {
      if (args.id) {
        const result = await getDeploymentOutput(
          { ...opts, deployment_id: args.id },
          ctx.executorContext,
        );
        return jsonResult(formatDeploymentOutput(args.id, result.data as string));
      }
      const result = await getDeploymentScript(opts, ctx.executorContext);
      return jsonResult(formatDeploymentScript(result.data as string));
    }

    case "update": {
      if (!args.content) return errorResult("Missing required field: content");
      await updateDeploymentScript(
        { ...opts, content: args.content as string },
        ctx.executorContext,
      );
      return jsonResult(formatDeploymentScriptUpdated(args.site_id, args.server_id));
    }

    default:
      return errorResult(
        `Unknown action "${action}" for deployments. Valid actions: list, deploy, get, update.`,
      );
  }
}
