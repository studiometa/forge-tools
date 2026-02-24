/**
 * Tool execution handlers for Forge MCP server.
 * Shared between stdio and HTTP transports.
 *
 * Single consolidated tool for minimal token overhead:
 * - forge: resource + action based API
 */

import type { ExecutorContext } from "@studiometa/forge-core";

import { HttpClient } from "@studiometa/forge-api";
import { RESOURCES } from "@studiometa/forge-core";

import type { CommonArgs, HandlerContext, ToolResult } from "./types.ts";

import { handleBackups } from "./backups.ts";
import { handleCertificates } from "./certificates.ts";
import { handleCommands } from "./commands.ts";
import { handleDaemons } from "./daemons.ts";
import { handleDatabases } from "./databases.ts";
import { handleDeployments } from "./deployments.ts";
import { handleEnv } from "./env.ts";
import { handleFirewallRules } from "./firewall-rules.ts";
import { handleHelp, handleHelpOverview } from "./help.ts";
import { handleMonitors } from "./monitors.ts";
import { handleNginxConfig } from "./nginx-config.ts";
import { handleNginxTemplates } from "./nginx-templates.ts";
import { handleRecipes } from "./recipes.ts";
import { handleRedirectRules } from "./redirect-rules.ts";
import { handleScheduledJobs } from "./scheduled-jobs.ts";
import { handleSchema, handleSchemaOverview } from "./schema.ts";
import { handleSecurityRules } from "./security-rules.ts";
import { handleServers } from "./servers.ts";
import { handleSites } from "./sites.ts";
import { handleSshKeys } from "./ssh-keys.ts";
import { handleUser } from "./user.ts";
import { isForgeApiError } from "@studiometa/forge-api";

import { isUserInputError } from "../errors.ts";
import { errorResult } from "./utils.ts";

export type { ToolResult } from "./types.ts";

/** Valid resources derived from core constants */
const VALID_RESOURCES = [...RESOURCES];

/**
 * Route to the appropriate resource handler.
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
    case "certificates":
      return handleCertificates(action, args, ctx);
    case "databases":
      return handleDatabases(action, args, ctx);
    case "daemons":
      return handleDaemons(action, args, ctx);
    case "firewall-rules":
      return handleFirewallRules(action, args, ctx);
    case "ssh-keys":
      return handleSshKeys(action, args, ctx);
    case "security-rules":
      return handleSecurityRules(action, args, ctx);
    case "redirect-rules":
      return handleRedirectRules(action, args, ctx);
    case "monitors":
      return handleMonitors(action, args, ctx);
    case "nginx-templates":
      return handleNginxTemplates(action, args, ctx);
    case "recipes":
      return handleRecipes(action, args, ctx);
    case "backups":
      return handleBackups(action, args, ctx);
    case "commands":
      return handleCommands(action, args, ctx);
    case "scheduled-jobs":
      return handleScheduledJobs(action, args, ctx);
    case "user":
      return handleUser(action, args, ctx);
    default:
      return Promise.resolve(
        errorResult(
          `Unknown resource "${resource}". Valid resources: ${VALID_RESOURCES.join(", ")}. Use action="help" for documentation.`,
        ),
      );
  }
}

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

  // Help is available for all resources (doesn't need API)
  if (action === "help") {
    return resource ? handleHelp(resource) : handleHelpOverview();
  }

  // Schema is available for all resources (doesn't need API)
  if (action === "schema") {
    return resource ? handleSchema(resource) : handleSchemaOverview();
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
    compact: compact ?? action !== "get",
    includeHints: action === "get",
  };

  // Route to resource handler with error catching
  try {
    return await routeToHandler(
      resource,
      action,
      { resource, action, ...rest } as CommonArgs,
      handlerContext,
    );
  } catch (error) {
    if (isUserInputError(error)) {
      return errorResult(error.toFormattedMessage());
    }
    if (isForgeApiError(error)) {
      return errorResult(`Forge API error (${error.status}): ${error.message}`);
    }
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(message);
  }
}
