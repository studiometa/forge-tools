/**
 * Tool execution handlers for Forge MCP server.
 * Shared between stdio and HTTP transports.
 *
 * Two tools with clear separation:
 * - forge: read-only operations (list, get, help, schema)
 * - forge_write: write operations (create, update, delete, deploy, reboot, etc.)
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
import { handleDatabaseUsers } from "./database-users.ts";
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
import { isWriteAction, isReadAction } from "../tools.ts";
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
    case "database-users":
      return handleDatabaseUsers(action, args, ctx);
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
    /* v8 ignore next 6 -- all valid resources are handled above; unreachable in practice */
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
 * Validates that the action matches the tool (read vs write).
 */
export async function executeToolWithCredentials(
  name: string,
  args: Record<string, unknown>,
  credentials: { apiToken: string },
): Promise<ToolResult> {
  const { resource, action, compact, ...rest } = args as CommonArgs;

  if (!resource || !action) {
    return errorResult('Missing required fields: "resource" and "action".');
  }

  // Validate action matches the tool
  if (name === "forge" && isWriteAction(action)) {
    return errorResult(
      `Action "${action}" is a write operation. Use the "forge_write" tool instead.`,
    );
  }

  if (name === "forge_write" && isReadAction(action)) {
    return errorResult(`Action "${action}" is a read operation. Use the "forge" tool instead.`);
  }

  // Help is available for all resources (doesn't need API)
  if (action === "help") {
    /* v8 ignore start */
    return resource ? handleHelp(resource) : handleHelpOverview();
    /* v8 ignore stop */
  }

  // Schema is available for all resources (doesn't need API)
  if (action === "schema") {
    /* v8 ignore start */
    return resource ? handleSchema(resource) : handleSchemaOverview();
    /* v8 ignore stop */
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
    /* v8 ignore start */
    const message = error instanceof Error ? error.message : String(error);
    /* v8 ignore stop */
    return errorResult(message);
  }
}
