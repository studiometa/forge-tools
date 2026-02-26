/**
 * Streamable HTTP transport for Forge MCP Server
 *
 * Implements the official MCP Streamable HTTP transport specification (2025-03-26)
 * using the SDK's StreamableHTTPServerTransport.
 *
 * Architecture:
 * - Stateful mode with per-session transport+server pairs (multi-tenant)
 * - Auth via Bearer token → authInfo.token → handler extra.authInfo
 * - Session manager (injected) maps session IDs to transport+server instances
 * - Health/status endpoints handled by h3, MCP endpoint by the SDK transport
 */

import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createApp, defineEventHandler, type H3 } from "h3";

import { parseAuthHeader } from "./auth.ts";
import { executeToolWithCredentials } from "./handlers/index.ts";
import { INSTRUCTIONS } from "./instructions.ts";
import { SessionManager } from "./sessions.ts";
import { getTools } from "./tools.ts";
import { VERSION } from "./version.ts";

export { SessionManager } from "./sessions.ts";

/**
 * Options for the HTTP MCP server.
 */
export interface HttpServerOptions {
  /** When true, forge_write tool is not registered and write operations are rejected. */
  readOnly?: boolean;
}

/**
 * Create a configured MCP Server instance for HTTP transport.
 *
 * Unlike stdio, HTTP mode does NOT include forge_configure/forge_get_config
 * because credentials come from the Authorization header per-request.
 */
export function createMcpServer(options?: HttpServerOptions): Server {
  const readOnly = options?.readOnly ?? false;
  const tools = getTools({ readOnly });

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
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args } = request.params;
    const token = extra.authInfo?.token;

    /* v8 ignore start */
    if (!token) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: Authentication required. No token found in request.",
          },
        ],
        isError: true,
      };
    }
    /* v8 ignore stop */

    // Reject write operations in read-only mode
    if (readOnly && name === "forge_write") {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: Server is running in read-only mode. Write operations are disabled.",
          },
        ],
        isError: true,
      };
    }

    try {
      const result = await executeToolWithCredentials(
        name,
        /* v8 ignore next */ (args as Record<string, unknown>) ?? {},
        { apiToken: token },
      );
      return result as unknown as Record<string, unknown>;
    } catch (error) {
      /* v8 ignore start */
      const message = error instanceof Error ? error.message : String(error);
      /* v8 ignore stop */
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Handle an MCP request using the Streamable HTTP transport.
 *
 * Routes requests based on whether they have a session ID:
 * - No session ID + initialize request → create new session
 * - Has session ID → route to existing session's transport
 *
 * @param req - Node.js IncomingMessage
 * @param res - Node.js ServerResponse
 * @param sessions - Session manager instance (injected)
 * @param options - Server options (read-only mode, etc.)
 */
export async function handleMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  sessions: SessionManager,
  options?: HttpServerOptions,
): Promise<void> {
  // Extract and validate auth
  const authHeader = req.headers.authorization;
  const credentials = parseAuthHeader(authHeader);

  if (!credentials) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message: "Authentication required. Provide a Bearer token with your Forge API token.",
        },
        id: null,
      }),
    );
    return;
  }

  // Inject auth info for the SDK transport
  const authenticatedReq = req as IncomingMessage & {
    auth?: { token: string; clientId: string; scopes: string[] };
  };
  authenticatedReq.auth = {
    token: credentials.apiToken,
    clientId: "forge-http-client",
    scopes: [],
  };

  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (sessionId) {
    // Existing session — route to its transport
    const session = sessions.get(sessionId);
    if (!session) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Session not found. The session may have expired or been terminated.",
          },
          id: null,
        }),
      );
      return;
    }

    await session.transport.handleRequest(authenticatedReq, res);
    return;
  }

  // No session ID — this should be an initialize request.
  // Create a new transport + server pair.
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  const server = createMcpServer(options);
  await server.connect(transport);

  // Set up cleanup on close
  transport.onclose = () => {
    const sid = transport.sessionId;
    /* v8 ignore start */
    if (sid) {
      sessions.remove(sid).catch(() => {
        // Ignore cleanup errors
      });
    }
    /* v8 ignore stop */
  };

  // Handle the request (this will set transport.sessionId during initialize)
  await transport.handleRequest(authenticatedReq, res);

  // After handling, register the session if the transport got a session ID
  /* v8 ignore start */
  if (transport.sessionId) {
    sessions.register(transport, server);
  } else {
    // No session was created (e.g., invalid request) — clean up
    await transport.close();
    await server.close();
  }
  /* v8 ignore stop */
}

/**
 * Create a request handler bound to a SessionManager instance.
 * Convenience factory for server.ts.
 */
export function createMcpRequestHandler(
  sessions: SessionManager,
  options?: HttpServerOptions,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  /* v8 ignore start */
  return (req, res) => handleMcpRequest(req, res, sessions, options);
  /* v8 ignore stop */
}

/**
 * Create h3 app for health check and service info endpoints.
 * The MCP endpoint is handled separately by handleMcpRequest.
 */
export function createHealthApp(): H3 {
  const app = createApp();

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

  return app;
}
