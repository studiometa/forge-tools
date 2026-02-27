#!/usr/bin/env node

/**
 * Forge MCP Server - HTTP Transport (Streamable HTTP)
 *
 * Implements the official MCP Streamable HTTP transport specification.
 * Credentials are passed via Bearer token in the Authorization header.
 *
 * Token format: raw Forge API token
 *
 * Usage:
 *   forge-mcp-server
 *   forge-mcp-server --read-only
 *   FORGE_READ_ONLY=true forge-mcp-server
 *   PORT=3000 forge-mcp-server
 *
 * Endpoints:
 *   POST /mcp   - MCP Streamable HTTP (JSON-RPC messages)
 *   GET  /mcp   - MCP Streamable HTTP (SSE stream for server notifications)
 *   DELETE /mcp - MCP Streamable HTTP (session termination)
 *   GET  /       - Service info
 *   GET  /health - Health check
 */

import { toNodeHandler } from "h3/node";
import { createServer, type Server } from "node:http";

import { createHealthApp, createMcpRequestHandler } from "./http.ts";
import { parseReadOnlyFlag } from "./flags.ts";
import { SessionManager } from "./sessions.ts";
import { VERSION } from "./version.ts";

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = "0.0.0.0";

/**
 * Options for the HTTP server.
 */
export interface HttpStartOptions {
  /** When true, forge_write tool is not registered. */
  readOnly?: boolean;
}

/**
 * Start the HTTP server with Streamable HTTP transport.
 */
export function startHttpServer(
  port: number = DEFAULT_PORT,
  host: string = DEFAULT_HOST,
  options?: HttpStartOptions,
): Promise<Server> {
  return new Promise((resolve) => {
    const readOnly = options?.readOnly ?? false;
    const sessions = new SessionManager();
    const handleMcp = createMcpRequestHandler(sessions, { readOnly });
    const healthApp = createHealthApp();
    const healthHandler = toNodeHandler(healthApp);

    const server = createServer(async (req, res) => {
      const url = req.url ?? "/";

      // Route /mcp to MCP Streamable HTTP transport
      if (url === "/mcp" || url.startsWith("/mcp?")) {
        await handleMcp(req, res);
        return;
      }

      // Everything else goes to h3 (health checks, service info)
      healthHandler(req, res);
    });

    server.listen(port, host, () => {
      const displayHost = host === "0.0.0.0" ? "localhost" : host;
      const mode = readOnly ? " (read-only)" : "";
      console.log(`Forge MCP server v${VERSION}${mode}`);
      console.log(`Node.js ${process.version}`);
      console.log("");
      console.log(`Running at http://${displayHost}:${port}`);
      console.log("");
      console.log("Endpoints:");
      console.log(
        `  POST/GET/DELETE http://${displayHost}:${port}/mcp - MCP Streamable HTTP endpoint`,
      );
      console.log(`  GET  http://${displayHost}:${port}/health - Health check`);
      console.log("");
      console.log("Authentication:");
      console.log("  Bearer token in Authorization header");
      console.log("  Token format: your raw Forge API token");
      if (readOnly) {
        console.log("");
        console.log("Mode: READ-ONLY (write operations disabled)");
      }
      console.log("");
      resolve(server);
    });
  });
}

// Start server when run directly
const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("/forge-mcp-server") ||
  process.argv[1]?.endsWith("\\forge-mcp-server");

if (isMainModule) {
  const port = Number.parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
  const host = process.env.HOST || DEFAULT_HOST;
  const readOnly = parseReadOnlyFlag();

  startHttpServer(port, host, { readOnly }).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
