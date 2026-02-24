#!/usr/bin/env node

/**
 * Forge MCP Server - HTTP Transport
 *
 * This is the remote HTTP server mode for Claude Desktop custom connectors.
 * Credentials are passed via Bearer token in the Authorization header.
 *
 * Token format: raw Forge API token (no base64 encoding needed)
 *
 * Usage:
 *   forge-mcp-server
 *   PORT=3000 forge-mcp-server
 *
 * Claude Desktop custom connector config:
 *   Name: Forge
 *   URL: https://your-server.example.com
 *   Authorization: Bearer <your-forge-api-token>
 */

import { toNodeHandler } from "h3/node";
import { createServer, type Server } from "node:http";

import { createHttpApp } from "./http.ts";
import { VERSION } from "./version.ts";

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = "0.0.0.0";

/**
 * Start the HTTP server
 */
export function startHttpServer(
  port: number = DEFAULT_PORT,
  host: string = DEFAULT_HOST,
): Promise<Server> {
  return new Promise((resolve) => {
    const app = createHttpApp();
    const server = createServer(toNodeHandler(app));

    server.listen(port, host, () => {
      const displayHost = host === "0.0.0.0" ? "localhost" : host;
      console.log(`Forge MCP server v${VERSION}`);
      console.log(`Node.js ${process.version}`);
      console.log("");
      console.log(`Running at http://${displayHost}:${port}`);
      console.log("");
      console.log("Endpoints:");
      console.log(`  POST http://${displayHost}:${port}/mcp - MCP JSON-RPC endpoint`);
      console.log(`  GET  http://${displayHost}:${port}/health - Health check`);
      console.log("");
      console.log("Authentication:");
      console.log("  Bearer token in Authorization header");
      console.log("  Token format: your raw Forge API token");
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

  startHttpServer(port, host).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
