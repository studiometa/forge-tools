import {
  getToken,
  getOrganizationSlug,
  setToken,
  setOrganizationSlug,
} from "@studiometa/forge-api";

import type { ToolResult } from "./handlers/types.ts";

import { executeToolWithCredentials } from "./handlers/index.ts";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getTools, STDIO_ONLY_TOOLS } from "./tools.ts";
import type { GetToolsOptions } from "./tools.ts";

export type { ToolResult };

/**
 * Get all available tools (including stdio-only configuration tools).
 *
 * @param options - Optional filtering. When `readOnly` is true, forge_write is excluded.
 */
export function getAvailableTools(options?: GetToolsOptions): Tool[] {
  return [...getTools(options), ...STDIO_ONLY_TOOLS];
}

/**
 * Handle the forge_configure tool.
 */
export function handleConfigureTool(args: {
  apiToken?: string;
  organizationSlug?: string;
}): ToolResult {
  if (!args.apiToken && !args.organizationSlug) {
    return {
      content: [
        {
          type: "text",
          text: "Error: at least one of apiToken or organizationSlug is required.",
        },
      ],
      structuredContent: {
        success: false,
        error: "at least one of apiToken or organizationSlug is required.",
      },
      isError: true,
    };
  }

  if (args.apiToken) {
    setToken(args.apiToken);
  }
  if (args.organizationSlug) {
    setOrganizationSlug(args.organizationSlug);
  }

  const maskedToken = args.apiToken ? `***${args.apiToken.slice(-4)}` : undefined;
  const data: Record<string, unknown> = {
    success: true,
    message: "Laravel Forge configuration updated successfully",
  };
  if (maskedToken) data.apiToken = maskedToken;
  if (args.organizationSlug) data.organizationSlug = args.organizationSlug;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: data,
  };
}

/**
 * Handle the forge_get_config tool.
 */
export function handleGetConfigTool(): ToolResult {
  const token = getToken();
  const orgSlug = getOrganizationSlug();

  const data = {
    apiToken: token ? `***${token.slice(-4)}` : "not configured",
    organizationSlug: orgSlug ?? "not configured",
    configured: !!token,
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: data,
  };
}

/**
 * Options for handleToolCall.
 */
export interface HandleToolCallOptions {
  /** When true, forge_write is rejected with an error. */
  readOnly?: boolean;
}

/**
 * Handle a tool call request.
 *
 * Routes to the appropriate handler based on tool name:
 * - forge_configure / forge_get_config — stdio-only config tools
 * - forge — read-only operations (list, get, help, schema)
 * - forge_write — write operations (create, update, delete, deploy, etc.)
 */
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  options?: HandleToolCallOptions,
): Promise<ToolResult> {
  if (name === "forge_configure") {
    return handleConfigureTool({
      apiToken: typeof args.apiToken === "string" ? args.apiToken : undefined,
      organizationSlug:
        typeof args.organizationSlug === "string" ? args.organizationSlug : undefined,
    });
  }

  if (name === "forge_get_config") {
    return handleGetConfigTool();
  }

  // Reject forge_write in read-only mode
  if (name === "forge_write" && options?.readOnly) {
    return {
      content: [
        {
          type: "text",
          text: "Error: Server is running in read-only mode. Write operations are disabled.",
        },
      ],
      structuredContent: {
        success: false,
        error: "Server is running in read-only mode. Write operations are disabled.",
      },
      isError: true,
    };
  }

  // Both forge and forge_write require authentication
  if (name === "forge" || name === "forge_write") {
    const apiToken = getToken();
    if (!apiToken) {
      return {
        content: [
          {
            type: "text",
            text: 'Error: Forge API token not configured. Use "forge_configure" tool or set FORGE_API_TOKEN environment variable.',
          },
        ],
        structuredContent: {
          success: false,
          error:
            'Forge API token not configured. Use "forge_configure" tool or set FORGE_API_TOKEN environment variable.',
        },
        isError: true,
      };
    }

    // Organization slug can come from:
    // 1. Tool args (per-request override, highest priority)
    // 2. Config/env (via getOrganizationSlug)
    const orgSlugFromArgs =
      typeof args.organizationSlug === "string" ? args.organizationSlug : undefined;
    const orgSlugFromConfig = getOrganizationSlug() ?? undefined;

    return executeToolWithCredentials(name, args, {
      apiToken,
      organizationSlug: orgSlugFromArgs ?? orgSlugFromConfig,
    });
  }

  return {
    content: [
      {
        type: "text",
        text: `Error: Unknown tool "${name}".`,
      },
    ],
    structuredContent: { success: false, error: `Unknown tool "${name}".` },
    isError: true,
  };
}
