import { getToken, setToken } from "@studiometa/forge-api";

import type { ToolResult } from "./handlers/types.ts";

import { executeToolWithCredentials } from "./handlers/index.ts";
import { STDIO_ONLY_TOOLS, TOOLS } from "./tools.ts";

export type { ToolResult };

/**
 * Get all available tools (including stdio-only configuration tools).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAvailableTools(): any[] {
  return [...TOOLS, ...STDIO_ONLY_TOOLS];
}

/**
 * Handle the forge_configure tool.
 */
export function handleConfigureTool(args: { apiToken: string }): ToolResult {
  if (!args.apiToken || typeof args.apiToken !== "string" || args.apiToken.trim().length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "Error: apiToken is required and must be a non-empty string.",
        },
      ],
      isError: true,
    };
  }

  setToken(args.apiToken);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            success: true,
            message: "Laravel Forge API token configured successfully",
            apiToken: `***${args.apiToken.slice(-4)}`,
          },
          null,
          2,
        ),
      },
    ],
  };
}

/**
 * Handle the forge_get_config tool.
 */
export function handleGetConfigTool(): ToolResult {
  const token = getToken();

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            apiToken: token ? `***${token.slice(-4)}` : "not configured",
            configured: !!token,
          },
          null,
          2,
        ),
      },
    ],
  };
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
): Promise<ToolResult> {
  if (name === "forge_configure") {
    return handleConfigureTool(args as { apiToken: string });
  }

  if (name === "forge_get_config") {
    return handleGetConfigTool();
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
        isError: true,
      };
    }

    return executeToolWithCredentials(name, args, { apiToken });
  }

  return {
    content: [
      {
        type: "text",
        text: `Error: Unknown tool "${name}".`,
      },
    ],
    isError: true,
  };
}
