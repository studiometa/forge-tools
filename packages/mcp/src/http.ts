/**
 * HTTP transport handlers for Forge MCP Server
 *
 * This module contains the app/router creation logic for the HTTP transport.
 * The actual server startup is in server.ts.
 */

import {
  createApp,
  defineEventHandler,
  readBody,
  getHeader,
  setResponseHeader,
  setResponseStatus,
  type H3,
} from "h3";

import { parseAuthHeader } from "./auth.ts";
import { executeToolWithCredentials } from "./handlers/index.ts";
import { INSTRUCTIONS } from "./instructions.ts";
import { TOOLS } from "./tools.ts";
import { VERSION } from "./version.ts";

/**
 * JSON-RPC error response
 */
export function jsonRpcError(
  code: number,
  message: string,
  id: string | number | null = null,
): { jsonrpc: string; error: { code: number; message: string }; id: string | number | null } {
  return {
    jsonrpc: "2.0",
    error: { code, message },
    id,
  };
}

/**
 * JSON-RPC success response
 */
export function jsonRpcSuccess(
  result: unknown,
  id: string | number | null = null,
): { jsonrpc: string; result: unknown; id: string | number | null } {
  return {
    jsonrpc: "2.0",
    result,
    id,
  };
}

/**
 * Handle the initialize JSON-RPC method
 */
export function handleInitialize(): {
  protocolVersion: string;
  serverInfo: { name: string; version: string };
  capabilities: { tools: Record<string, never> };
  instructions: string;
} {
  return {
    protocolVersion: "2024-11-05",
    serverInfo: {
      name: "forge-mcp",
      version: VERSION,
    },
    capabilities: {
      tools: {},
    },
    instructions: INSTRUCTIONS,
  };
}

/**
 * Handle the tools/list JSON-RPC method
 */
export function handleToolsList(): { tools: typeof TOOLS } {
  return { tools: TOOLS };
}

/**
 * Create the h3 application with all routes
 */
export function createHttpApp(): H3 {
  const app = createApp();

  // Health check endpoints
  app.get(
    "/",
    defineEventHandler(() => {
      return { status: "ok", service: "forge-mcp", version: VERSION };
    }),
  );

  app.get(
    "/health",
    defineEventHandler(() => {
      return { status: "ok" };
    }),
  );

  // MCP endpoint - handles JSON-RPC over HTTP
  app.post(
    "/mcp",
    defineEventHandler(async (event) => {
      // Parse authorization header
      const authHeader = getHeader(event, "authorization");
      const credentials = parseAuthHeader(authHeader);

      if (!credentials) {
        setResponseHeader(event, "Content-Type", "application/json");
        setResponseStatus(event, 401);
        return jsonRpcError(
          -32001,
          "Authentication required. Provide a Bearer token with your Forge API token.",
        );
      }

      setResponseHeader(event, "Content-Type", "application/json");

      // Parse JSON-RPC request
      let body: { method?: string; params?: unknown; id?: string | number };
      try {
        body = (await readBody(event)) as {
          method?: string;
          params?: unknown;
          id?: string | number;
        };
      } catch {
        setResponseStatus(event, 400);
        return jsonRpcError(-32700, "Parse error: Invalid JSON");
      }

      if (!body || typeof body !== "object") {
        setResponseStatus(event, 400);
        return jsonRpcError(-32700, "Parse error: Invalid JSON");
      }

      const { method, params, id } = body;

      try {
        if (method === "initialize") {
          return jsonRpcSuccess(handleInitialize(), id ?? null);
        }

        if (method === "tools/list") {
          return jsonRpcSuccess(handleToolsList(), id ?? null);
        }

        if (method === "tools/call") {
          const { name, arguments: args } = params as {
            name: string;
            arguments?: Record<string, unknown>;
          };
          const result = await executeToolWithCredentials(name, args || {}, credentials);
          return jsonRpcSuccess(result, id ?? null);
        }

        // Unknown method
        return jsonRpcError(-32601, `Method not found: ${method}`, id ?? null);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return jsonRpcError(-32603, `Internal error: ${message}`, id ?? null);
      }
    }),
  );

  return app;
}
