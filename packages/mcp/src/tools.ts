import { RESOURCES } from "@studiometa/forge-core";

/**
 * Tool type matching MCP SDK expectations.
 */
interface Tool {
  name: string;
  description: string;
  annotations?: Record<string, unknown>;
  inputSchema: Record<string, unknown>;
}

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
 * Shared input schema properties used by both forge and forge_write tools.
 */
const SHARED_INPUT_PROPERTIES = {
  resource: {
    type: "string",
    enum: [...RESOURCES],
  },
  id: { type: "string", description: "Resource ID" },
  server_id: { type: "string", description: "Server ID (required for most resources)" },
  site_id: { type: "string", description: "Site ID (required for site-level resources)" },
  compact: {
    type: "boolean",
    description: "Compact output (default: true for list, false for get)",
  },
} as const;

/**
 * Read-only tool for querying Forge resources.
 *
 * Annotated with readOnlyHint so MCP clients like Claude Desktop
 * can auto-approve read operations.
 */
const FORGE_READ_TOOL: Tool = {
  name: "forge",
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
    type: "object",
    properties: {
      ...SHARED_INPUT_PROPERTIES,
      action: {
        type: "string",
        enum: [...READ_ACTIONS],
        description: 'Use "help" for resource documentation',
      },
    },
    required: ["resource", "action"],
  },
};

/**
 * Write tool for mutating Forge resources.
 *
 * Annotated with destructiveHint so MCP clients always prompt
 * for confirmation before executing writes.
 */
const FORGE_WRITE_TOOL: Tool = {
  name: "forge_write",
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
    type: "object",
    properties: {
      ...SHARED_INPUT_PROPERTIES,
      action: {
        type: "string",
        enum: [...WRITE_ACTIONS],
        description: "Write action to perform",
      },
      // Server fields
      name: { type: "string" },
      provider: { type: "string" },
      region: { type: "string" },
      size: { type: "string" },
      credential_id: { type: "string" },
      type: { type: "string" },
      // Site fields
      domain: { type: "string" },
      project_type: { type: "string" },
      directory: { type: "string" },
      // Content fields (env, nginx, deployment script)
      content: { type: "string", description: "Content for env, nginx, or deployment script" },
      // Daemon fields
      command: { type: "string", description: "Shell command (daemons, recipes)" },
      user: { type: "string", description: "Execution user (daemons, recipes)" },
      // Firewall fields
      port: { type: ["string", "number"], description: "Port number or range (firewall rules)" },
      ip_address: { type: "string", description: "IP address (firewall rules)" },
      // SSH key fields
      key: { type: "string", description: "Public SSH key content" },
      // Redirect fields
      from: { type: "string", description: "Source path (redirect rules)" },
      to: { type: "string", description: "Destination URL (redirect rules)" },
      // Security rule fields
      credentials: {
        type: "array",
        description: "Credentials array [{username, password}] (security rules)",
        items: { type: "object" },
      },
      // Monitor fields
      operator: { type: "string", description: "Comparison operator (monitors)" },
      threshold: { type: "number", description: "Threshold value (monitors)" },
      minutes: { type: "number", description: "Check interval in minutes (monitors)" },
      // Recipe fields
      script: { type: "string", description: "Bash script content (recipes)" },
      servers: {
        type: "array",
        description: "Server IDs to run recipe on",
        items: { type: "number" },
      },
    },
    required: ["resource", "action"],
  },
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
    description: "Configure Laravel Forge API token",
    annotations: {
      title: "Configure Forge",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: "object",
      properties: {
        apiToken: { type: "string", description: "Your Laravel Forge API token" },
      },
      required: ["apiToken"],
    },
  },
  {
    name: "forge_get_config",
    description: "Get current Forge configuration",
    annotations: {
      title: "Get Forge Config",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];
