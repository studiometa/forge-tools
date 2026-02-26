import type { Tool } from "@modelcontextprotocol/sdk/types.js";

import { RESOURCES } from "@studiometa/forge-core";

/**
 * Read-only actions — safe operations that don't modify server state.
 */
export const READ_ACTIONS = ["list", "get", "help", "schema"] as const;

/**
 * Write actions — operations that modify server state.
 * These are separated into the `forge_write` tool for safety.
 */
export const WRITE_ACTIONS = [
  "create",
  "update",
  "delete",
  "deploy",
  "reboot",
  "restart",
  "activate",
  "run",
] as const;

export type ReadAction = (typeof READ_ACTIONS)[number];
export type WriteAction = (typeof WRITE_ACTIONS)[number];

/**
 * Check if an action is a write action.
 */
export function isWriteAction(action: string): action is WriteAction {
  return (WRITE_ACTIONS as readonly string[]).includes(action);
}

/**
 * Check if an action is a read action.
 */
export function isReadAction(action: string): action is ReadAction {
  return (READ_ACTIONS as readonly string[]).includes(action);
}

/**
 * Output schema shared by all forge tools.
 *
 * All tools return a consistent envelope:
 * - success: true/false
 * - result: the resource data (shape varies by resource and action)
 * - error: error message (only when success is false)
 *
 * The `result` field contains resource-specific data:
 * - list actions → array of resource objects
 * - get actions → single resource object (or string for env/nginx/scripts)
 * - help/schema → documentation text or schema object
 * - write actions → confirmation message or updated resource
 */
const OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    success: {
      type: "boolean" as const,
      description: "Whether the operation succeeded",
    } as object,
    result: {
      description:
        "Operation result — shape varies by resource and action (array for list, object for get, string for text content)",
    } as object,
    error: {
      type: "string" as const,
      description: "Error message (only present on failure)",
    } as object,
  },
  required: ["success"],
};

/**
 * Shared input schema properties used by both forge and forge_write tools.
 */
const SHARED_INPUT_PROPERTIES = {
  resource: {
    type: "string" as const,
    enum: [...RESOURCES],
    description: "Forge resource to operate on",
  },
  id: { type: "string" as const, description: "Resource ID (for get, delete, update actions)" },
  server_id: { type: "string" as const, description: "Server ID (required for most resources)" },
  site_id: {
    type: "string" as const,
    description:
      "Site ID (required for site-level resources: deployments, env, certificates, etc.)",
  },
  compact: {
    type: "boolean" as const,
    description: "Compact output (default: true for list, false for get)",
  },
};

/**
 * Read-only tool for querying Forge resources.
 *
 * Annotated with readOnlyHint so MCP clients like Claude Desktop
 * can auto-approve read operations.
 */
const FORGE_READ_TOOL: Tool = {
  name: "forge",
  title: "Laravel Forge",
  description: [
    "Laravel Forge API — read operations.",
    `Resources: ${RESOURCES.join(", ")}.`,
    `Actions: ${[...READ_ACTIONS].join(", ")}.`,
    "Discovery: action=help with any resource for filters and examples.",
    "Server operations require id. Site operations require server_id.",
    "Deployment operations require server_id and site_id.",
  ].join("\n"),
  annotations: {
    title: "Laravel Forge",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  inputSchema: {
    type: "object" as const,
    properties: {
      ...SHARED_INPUT_PROPERTIES,
      action: {
        type: "string" as const,
        enum: [...READ_ACTIONS],
        description: 'Read action to perform. Use "help" for resource documentation.',
      },
    },
    required: ["resource", "action"],
  },
  outputSchema: OUTPUT_SCHEMA,
};

/**
 * Write tool for mutating Forge resources.
 *
 * Annotated with destructiveHint so MCP clients always prompt
 * for confirmation before executing writes.
 */
const FORGE_WRITE_TOOL: Tool = {
  name: "forge_write",
  title: "Laravel Forge (Write)",
  description: [
    "Laravel Forge API — write operations (create, update, delete, deploy, reboot, etc.).",
    `Resources: ${RESOURCES.join(", ")}.`,
    `Actions: ${[...WRITE_ACTIONS].join(", ")}.`,
    "Server operations require id. Site operations require server_id.",
    "Deployment operations require server_id and site_id.",
    "Use forge tool with action=help for resource documentation.",
  ].join("\n"),
  annotations: {
    title: "Laravel Forge (Write)",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: {
    type: "object" as const,
    properties: {
      ...SHARED_INPUT_PROPERTIES,
      action: {
        type: "string" as const,
        enum: [...WRITE_ACTIONS],
        description: "Write action to perform",
      },
      // Server fields
      name: {
        type: "string" as const,
        description: "Resource name (servers, databases, daemons, etc.)",
      },
      provider: {
        type: "string" as const,
        description: "Server provider (e.g. ocean2, linode, aws)",
      },
      region: { type: "string" as const, description: "Server region (e.g. nyc3, us-east-1)" },
      size: { type: "string" as const, description: "Server size (e.g. s-1vcpu-1gb)" },
      credential_id: {
        type: "string" as const,
        description: "Provider credential ID for server creation",
      },
      type: {
        type: "string" as const,
        description:
          "Resource type (e.g. app, web, worker for servers; mysql, postgres for databases; disk_usage, used_memory for monitors)",
      },
      // Site fields
      domain: { type: "string" as const, description: "Site domain name (e.g. example.com)" },
      project_type: {
        type: "string" as const,
        description: "Site project type (e.g. php, html, symfony, laravel)",
      },
      directory: {
        type: "string" as const,
        description: "Web directory relative to site root (e.g. /public)",
      },
      // Content fields (env, nginx, deployment script)
      content: {
        type: "string" as const,
        description: "Content body for env variables, nginx config, or deployment script updates",
      },
      // Daemon fields
      command: {
        type: "string" as const,
        description:
          "Shell command to execute (daemons: background process command; recipes: bash script inline; commands: site command)",
      },
      user: {
        type: "string" as const,
        description: "Unix user to run as (daemons, scheduled jobs; e.g. forge, root)",
      },
      // Firewall fields
      port: {
        type: ["string", "number"] as unknown as string,
        description: "Port number or range (firewall rules, e.g. 80 or 8000-9000)",
      },
      ip_address: {
        type: "string" as const,
        description: "IP address to allow/block (firewall rules, e.g. 192.168.1.1)",
      },
      // SSH key fields
      key: {
        type: "string" as const,
        description: "Public SSH key content (ssh-rsa ... or ssh-ed25519 ...)",
      },
      // Redirect fields
      from: {
        type: "string" as const,
        description: "Source path for redirect rules (e.g. /old-page)",
      },
      to: {
        type: "string" as const,
        description: "Destination URL for redirect rules (e.g. /new-page)",
      },
      // Security rule fields
      credentials: {
        type: "array" as const,
        description: "HTTP basic auth credentials for security rules [{username, password}]",
        items: { type: "object" as const },
      },
      // Monitor fields
      operator: {
        type: "string" as const,
        description: "Comparison operator for monitors (e.g. gte, lte)",
      },
      threshold: {
        type: "number" as const,
        description: "Threshold value that triggers the monitor alert",
      },
      minutes: {
        type: "number" as const,
        description: "Check interval in minutes for monitors (e.g. 5)",
      },
      // Scheduled job fields
      frequency: {
        type: "string" as const,
        description: "Cron frequency for scheduled jobs (e.g. minutely, hourly, nightly, custom)",
      },
      // Recipe fields
      script: { type: "string" as const, description: "Bash script content for recipes" },
      servers: {
        type: "array" as const,
        description: "Server IDs to run a recipe on (e.g. [123, 456])",
        items: { type: "number" as const },
      },
    },
    required: ["resource", "action"],
  },
  outputSchema: OUTPUT_SCHEMA,
};

/**
 * Core tools available in both stdio and HTTP transports.
 *
 * Split into two tools for safety:
 * - `forge` — read-only operations (auto-approvable by MCP clients)
 * - `forge_write` — write operations (always requires confirmation)
 */
export const TOOLS: Tool[] = [FORGE_READ_TOOL, FORGE_WRITE_TOOL];

/**
 * Options for filtering available tools.
 */
export interface GetToolsOptions {
  /** When true, only read-only tools are returned (forge_write is excluded). */
  readOnly?: boolean;
}

/**
 * Get the list of core tools, optionally filtered.
 *
 * In read-only mode, forge_write is excluded entirely — it won't appear
 * in the tool listing and cannot be called.
 */
export function getTools(options?: GetToolsOptions): Tool[] {
  if (options?.readOnly) {
    return TOOLS.filter((t) => t.name !== "forge_write");
  }
  return [...TOOLS];
}

/**
 * Additional tools only available in stdio mode.
 */
export const STDIO_ONLY_TOOLS: Tool[] = [
  {
    name: "forge_configure",
    title: "Configure Forge",
    description:
      "Configure Laravel Forge API token. The token is stored locally in the XDG config directory.",
    annotations: {
      title: "Configure Forge",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: "object" as const,
      properties: {
        apiToken: { type: "string" as const, description: "Your Laravel Forge API token" },
      },
      required: ["apiToken"],
    },
    outputSchema: {
      type: "object" as const,
      properties: {
        success: { type: "boolean" as const },
        message: { type: "string" as const, description: "Confirmation message" },
        apiToken: { type: "string" as const, description: "Masked API token (last 4 chars)" },
      },
      required: ["success"],
    },
  },
  {
    name: "forge_get_config",
    title: "Get Forge Config",
    description: "Get current Forge configuration (shows masked token and config status).",
    annotations: {
      title: "Get Forge Config",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
    outputSchema: {
      type: "object" as const,
      properties: {
        apiToken: { type: "string" as const, description: "Masked API token or 'not configured'" },
        configured: { type: "boolean" as const, description: "Whether a token is configured" },
      },
      required: ["configured"],
    },
  },
];
