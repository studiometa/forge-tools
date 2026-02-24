/**
 * Streamable HTTP transport for Forge MCP Server
 *
 * Implements the official MCP Streamable HTTP transport specification (2025-03-26)
 * using the SDK's StreamableHTTPServerTransport.
 *
 * Architecture:
 * - Stateful mode with per-session transport+server pairs (multi-tenant)
 * - Auth via Bearer token → authInfo.token → handler extra.authInfo
 * - Session manager maps session IDs to transport+server instances
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
import { TOOLS } from "./tools.ts";
import { VERSION } from "./version.ts";

/**
 * A managed session: transport + MCP server pair.
 */
interface ManagedSession {
  transport: StreamableHTTPServerTransport;
  server: Server;
  createdAt: number;
}

/**
 * Session manager for multi-tenant Streamable HTTP transport.
 *
 * Each MCP client session gets its own transport + server pair.
 * Sessions are identified by UUID and tracked in a Map.
 */
export class SessionManager {
  private sessions = new Map<string, ManagedSession>();

  /**
   * Register a session after its ID has been assigned by the transport.
   */
  register(transport: StreamableHTTPServerTransport, server: Server): void {
    const sessionId = transport.sessionId;
    if (sessionId) {
      this.sessions.set(sessionId, {
        transport,
        server,
        createdAt: Date.now(),
      });
    }
  }

  /**
   * Look up a session by its ID.
   */
  get(sessionId: string): ManagedSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Remove a session.
   */
  async remove(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      await session.transport.close();
      await session.server.close();
    }
  }

  /**
   * Get the number of active sessions.
   */
  get size(): number {
    return this.sessions.size;
  }

  /**
   * Close all sessions and clean up.
   */
  async closeAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const [, session] of this.sessions) {
      promises.push(session.transport.close());
      promises.push(session.server.close());
    }
    await Promise.all(promises);
    this.sessions.clear();
  }
}

/**
 * Create a configured MCP Server instance for HTTP transport.
 *
 * Unlike stdio, HTTP mode does NOT include forge_configure/forge_get_config
 * because credentials come from the Authorization header per-request.
 */
export function createMcpServer(): Server {
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
    return { tools: TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args } = request.params;
    const token = extra.authInfo?.token;

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

    try {
      const result = await executeToolWithCredentials(
        name,
        (args as Record<string, unknown>) ?? {},
        { apiToken: token },
      );
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

/** Singleton session manager for the HTTP server */
let _sessionManager: SessionManager | undefined;

/**
 * Get or create the session manager singleton.
 */
export function getSessionManager(): SessionManager {
  if (!_sessionManager) {
    _sessionManager = new SessionManager();
  }
  return _sessionManager;
}

/**
 * Reset the session manager (for testing).
 */
export function resetSessionManager(): void {
  _sessionManager = undefined;
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
 */
export async function handleMcpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
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

  const sessionManager = getSessionManager();
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (sessionId) {
    // Existing session — route to its transport
    const session = sessionManager.get(sessionId);
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

  const server = createMcpServer();
  await server.connect(transport);

  // Set up cleanup on close
  transport.onclose = () => {
    const sid = transport.sessionId;
    if (sid) {
      sessionManager.remove(sid).catch(() => {
        // Ignore cleanup errors
      });
    }
  };

  // Handle the request (this will set transport.sessionId during initialize)
  await transport.handleRequest(authenticatedReq, res);

  // After handling, register the session if the transport got a session ID
  if (transport.sessionId) {
    sessionManager.register(transport, server);
  } else {
    // No session was created (e.g., invalid request) — clean up
    await transport.close();
    await server.close();
  }
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
