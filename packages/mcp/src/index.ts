#!/usr/bin/env node

/**
 * Forge MCP Server — Stdio Transport
 *
 * This is the local execution mode using stdio transport.
 * For remote HTTP deployment, use server.ts instead.
 *
 * Usage:
 *   npx @studiometa/forge-mcp
 *
 * Or in Claude Desktop config:
 *   {
 *     "mcpServers": {
 *       "forge": {
 *         "command": "forge-mcp",
 *         "env": { "FORGE_API_TOKEN": "your-token" }
 *       }
 *     }
 *   }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { INSTRUCTIONS } from "./instructions.ts";
import { getAvailableTools, handleToolCall } from "./stdio.ts";
import { VERSION } from "./version.ts";

/**
 * Create and configure the MCP server.
 */
export function createStdioServer(): Server {
  const server = new Server(
    {
      name: "forge-mcp",
      version: VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
      instructions: INSTRUCTIONS,
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: getAvailableTools() };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await handleToolCall(name, (args as Record<string, unknown>) ?? {});
      return result as unknown as Record<string, unknown>;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Start the stdio server.
 */
export async function startStdioServer(): Promise<void> {
  const server = createStdioServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Forge MCP server v${VERSION} running on stdio`);
}

// Start server when run directly
const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("/forge-mcp") ||
  process.argv[1]?.endsWith("\\forge-mcp");

if (isMainModule) {
  startStdioServer().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
