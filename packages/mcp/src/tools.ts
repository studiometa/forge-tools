import { ACTIONS, RESOURCES } from "@studiometa/forge-core";

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
 * Generate the tool description dynamically from the constants.
 */
function generateDescription(): string {
  return [
    "Laravel Forge API.",
    `Resources: ${RESOURCES.join(", ")}.`,
    `Actions: ${ACTIONS.join(", ")} (varies by resource).`,
    "Discovery: action=help with any resource for filters and examples.",
    "Server operations require id. Site operations require server_id.",
    "Deployment operations require server_id and site_id.",
  ].join("\n");
}

/**
 * Single consolidated tool for Laravel Forge MCP server.
 *
 * The resource/action enums and description are derived from
 * the shared constants in forge-core — the single source of truth.
 */
export const TOOLS: Tool[] = [
  {
    name: "forge",
    description: generateDescription(),
    annotations: {
      title: "Laravel Forge",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: "object",
      properties: {
        resource: {
          type: "string",
          enum: [...RESOURCES],
        },
        action: {
          type: "string",
          enum: [...ACTIONS],
          description: 'Use "help" for resource documentation',
        },
        id: { type: "string", description: "Resource ID" },
        server_id: { type: "string", description: "Server ID (required for most resources)" },
        site_id: { type: "string", description: "Site ID (required for site-level resources)" },
        compact: {
          type: "boolean",
          description: "Compact output (default: true for list, false for get)",
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
      },
      required: ["resource", "action"],
    },
  },
];

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
