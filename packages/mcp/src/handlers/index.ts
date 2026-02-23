import type { ExecutorContext } from "@studiometa/forge-core";

import { HttpClient } from "@studiometa/forge-api";
import { RESOURCES } from "@studiometa/forge-core";

import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

import { handleDeployments } from "./deployments.ts";
import { handleEnv } from "./env.ts";
import { handleHelp } from "./help.ts";
import { handleNginxConfig } from "./nginx-config.ts";
import { handleServers } from "./servers.ts";
import { handleSites } from "./sites.ts";
import { errorResult } from "./utils.ts";

export type { ToolResult } from "./types.ts";

/** Valid resources derived from core constants */
const VALID_RESOURCES = [...RESOURCES];

/**
 * Execute a tool call with provided credentials.
 *
 * This is the main entry point shared between stdio and HTTP transports.
 */
export async function executeToolWithCredentials(
  _name: string,
  args: Record<string, unknown>,
  credentials: { apiToken: string },
): Promise<ToolResult> {
  const { resource, action, compact, ...rest } = args as CommonArgs;

  if (!resource || !action) {
    return errorResult('Missing required fields: "resource" and "action".');
  }

  // Help is available for all resources
  if (action === "help") {
    return handleHelp(resource);
  }

  // Validate resource
  if (!VALID_RESOURCES.includes(resource as (typeof VALID_RESOURCES)[number])) {
    return errorResult(
      `Unknown resource "${resource}". Valid resources: ${VALID_RESOURCES.join(", ")}. Use action="help" for documentation.`,
    );
  }

  // Create executor context
  const client = new HttpClient({ token: credentials.apiToken });
  const executorContext: ExecutorContext = { client };
  const handlerContext: HandlerContext = {
    executorContext,
    compact: compact !== false,
  };

  // Route to resource handler
  return routeToHandler(
    resource,
    action,
    { resource, action, ...rest } as CommonArgs,
    handlerContext,
  );
}

/**
 * Route a tool call to the appropriate resource handler.
 */
function routeToHandler(
  resource: string,
  action: string,
  args: CommonArgs,
  ctx: HandlerContext,
): Promise<ToolResult> {
  switch (resource) {
    case "servers":
      return handleServers(action, args, ctx);
    case "sites":
      return handleSites(action, args, ctx);
    case "deployments":
      return handleDeployments(action, args, ctx);
    case "env":
      return handleEnv(action, args, ctx);
    case "nginx":
      return handleNginxConfig(action, args, ctx);
    default:
      return Promise.resolve(
        errorResult(
          `Resource "${resource}" is not yet fully implemented. Use action="help" for available resources.`,
        ),
      );
  }
}
