import { toNodeHandler } from "h3/node";
import { createServer, type Server as HttpServer } from "node:http";
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";

// Mock the handlers module
vi.mock("./handlers/index.ts", () => ({
  executeToolWithCredentials: vi
    .fn()
    .mockImplementation((name: string, args: unknown, _credentials: unknown) => {
      if (name === "failing_tool") {
        throw new Error("Tool execution failed");
      }
      return Promise.resolve({
        content: [{ type: "text", text: JSON.stringify({ tool: name, args }) }],
      });
    }),
}));

import { executeToolWithCredentials } from "./handlers/index.ts";
import {
  createMcpServer,
  handleMcpRequest,
  createHealthApp,
  createMcpRequestHandler,
  SessionManager,
} from "./http.ts";
import { VERSION } from "./version.ts";

/**
 * Standard headers required by the MCP Streamable HTTP specification.
 * The Accept header MUST include both application/json and text/event-stream.
 */
const MCP_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/event-stream",
};

/**
 * Parse SSE event stream text into JSON-RPC messages.
 */
function parseSSEMessages(text: string): Array<Record<string, unknown>> {
  const messages: Array<Record<string, unknown>> = [];
  const events = text.split("\n\n").filter(Boolean);

  for (const event of events) {
    const lines = event.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data) {
          try {
            messages.push(JSON.parse(data));
          } catch {
            // Skip non-JSON data lines
          }
        }
      }
    }
  }

  return messages;
}

/**
 * Create a test HTTP server wired to a fresh SessionManager.
 * Returns the server, base URL, and session manager for assertions.
 */
async function createTestServer(
  sessions?: SessionManager,
): Promise<{ server: HttpServer; baseUrl: string; sessions: SessionManager }> {
  const mgr = sessions ?? new SessionManager({ ttl: 0 });
  const healthApp = createHealthApp();
  const healthHandler = toNodeHandler(healthApp);

  const server = createServer(async (req, res) => {
    const url = req.url ?? "/";

    if (url === "/mcp" || url.startsWith("/mcp?")) {
      await handleMcpRequest(req, res, mgr);
      return;
    }

    healthHandler(req, res);
  });

  const baseUrl = await new Promise<string>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address && typeof address === "object") {
        resolve(`http://127.0.0.1:${address.port}`);
      }
    });
  });

  return { server, baseUrl, sessions: mgr };
}

/**
 * Close a test server and its sessions.
 */
async function closeTestServer(server: HttpServer, sessions: SessionManager): Promise<void> {
  await sessions.closeAll();
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
}

/**
 * Helper: perform MCP initialize and return the session ID + response messages.
 */
async function initializeSession(
  baseUrl: string,
  token: string,
): Promise<{ sessionId: string; messages: Array<Record<string, unknown>> }> {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: { ...MCP_HEADERS, Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0" },
      },
      id: 1,
    }),
  });

  const sessionId = response.headers.get("mcp-session-id") ?? "";
  const text = await response.text();
  const messages = parseSSEMessages(text);

  return { sessionId, messages };
}

/**
 * Helper: send initialized notification to complete the handshake.
 */
async function sendInitializedNotification(
  baseUrl: string,
  token: string,
  sessionId: string,
): Promise<number> {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: {
      ...MCP_HEADERS,
      Authorization: `Bearer ${token}`,
      "mcp-session-id": sessionId,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    }),
  });
  await response.text();
  return response.status;
}

// --------------------------------------------------------------------------
// Unit tests for createMcpServer
// --------------------------------------------------------------------------
describe("createMcpServer", () => {
  it("should create a Server instance", () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
  });
});

// --------------------------------------------------------------------------
// Unit tests for createHealthApp
// --------------------------------------------------------------------------
describe("createHealthApp", () => {
  let server: HttpServer;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createHealthApp();
    server = createServer(toNodeHandler(app));

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        if (address && typeof address === "object") {
          baseUrl = `http://127.0.0.1:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("GET / should return service info", async () => {
    const response = await fetch(`${baseUrl}/`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: "ok",
      service: "forge-mcp",
      version: VERSION,
    });
  });

  it("GET /health should return ok", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "ok" });
  });

  // OAuth endpoints served by createHealthApp
  it("GET /.well-known/oauth-authorization-server should return OAuth metadata", async () => {
    const response = await fetch(`${baseUrl}/.well-known/oauth-authorization-server`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.authorization_endpoint).toContain("/authorize");
    expect(data.token_endpoint).toContain("/token");
    expect(data.code_challenge_methods_supported).toEqual(["S256"]);
  });

  it("GET /.well-known/oauth-protected-resource should return resource metadata", async () => {
    const response = await fetch(`${baseUrl}/.well-known/oauth-protected-resource`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.resource).toContain("/mcp");
    expect(data.bearer_methods_supported).toEqual(["header"]);
  });

  it("POST /register should register a client", async () => {
    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: "Test" }),
    });
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.client_id).toBeTruthy();
  });
});

// --------------------------------------------------------------------------
// Integration tests for Streamable HTTP MCP endpoint
// --------------------------------------------------------------------------
describe("Streamable HTTP MCP endpoint", () => {
  let server: HttpServer;
  let baseUrl: string;
  let sessions: SessionManager;

  const validToken = "test-forge-api-token-1234";

  beforeAll(async () => {
    const ctx = await createTestServer();
    server = ctx.server;
    baseUrl = ctx.baseUrl;
    sessions = ctx.sessions;
  });

  afterAll(async () => {
    await closeTestServer(server, sessions);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Authentication tests ---

  describe("authentication", () => {
    it("should return 401 without auth header", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0" },
          },
          id: 1,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe(-32001);
      expect(data.error.message).toContain("Authentication required");
    });

    it("should include WWW-Authenticate header pointing to protected resource metadata", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0" },
          },
          id: 1,
        }),
      });

      expect(response.status).toBe(401);
      const wwwAuth = response.headers.get("www-authenticate");
      expect(wwwAuth).toBeTruthy();
      expect(wwwAuth).toContain("Bearer");
      expect(wwwAuth).toContain("resource_metadata=");
      expect(wwwAuth).toContain("/.well-known/oauth-protected-resource");
    });

    it("should return 401 with non-Bearer auth", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          ...MCP_HEADERS,
          Authorization: "Basic dXNlcjpwYXNz",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0" },
          },
          id: 1,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe(-32001);
    });

    it("should return 401 with empty Bearer token", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          ...MCP_HEADERS,
          Authorization: "Bearer ",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0" },
          },
          id: 1,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe(-32001);
    });

    it("should return 401 for GET /mcp without auth", async () => {
      const response = await fetch(`${baseUrl}/mcp`, { method: "GET" });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe(-32001);
    });

    it("should return 401 for DELETE /mcp without auth", async () => {
      const response = await fetch(`${baseUrl}/mcp`, { method: "DELETE" });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe(-32001);
    });
  });

  // --- Session management tests ---

  describe("session management", () => {
    it("should return 404 for unknown session ID", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          ...MCP_HEADERS,
          Authorization: `Bearer ${validToken}`,
          "mcp-session-id": "nonexistent-session-id",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/list",
          id: 1,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe(-32000);
      expect(data.error.message).toContain("Session not found");
    });
  });

  // --- Initialize tests ---

  describe("initialize", () => {
    it("should handle initialize and return server info with session ID", async () => {
      const { sessionId, messages } = await initializeSession(baseUrl, validToken);

      // Should have a session ID
      expect(sessionId).toBeTruthy();
      expect(sessionId.length).toBeGreaterThan(0);

      // Should have the initialize response
      expect(messages.length).toBeGreaterThan(0);
      const initResponse = messages.find(
        (m) => "result" in m && (m.result as Record<string, unknown>)?.serverInfo,
      );
      expect(initResponse).toBeDefined();

      const result = initResponse!.result as Record<string, unknown>;
      const serverInfo = result.serverInfo as Record<string, unknown>;
      expect(serverInfo.name).toBe("forge-mcp");
      expect(serverInfo.version).toBe(VERSION);
      expect(result.protocolVersion).toBe("2025-03-26");
      expect(result.capabilities).toBeDefined();
    });

    it("should include instructions in initialize response", async () => {
      const { messages } = await initializeSession(baseUrl, validToken);

      const initResponse = messages.find(
        (m) => "result" in m && (m.result as Record<string, unknown>)?.instructions,
      );
      expect(initResponse).toBeDefined();

      const result = initResponse!.result as Record<string, unknown>;
      expect(typeof result.instructions).toBe("string");
      expect((result.instructions as string).length).toBeGreaterThan(0);
    });
  });

  // --- tools/list tests ---

  describe("tools/list", () => {
    it("should list tools after initialization", async () => {
      const { sessionId } = await initializeSession(baseUrl, validToken);
      await sendInitializedNotification(baseUrl, validToken, sessionId);

      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          ...MCP_HEADERS,
          Authorization: `Bearer ${validToken}`,
          "mcp-session-id": sessionId,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/list",
          id: 2,
        }),
      });

      expect(response.ok).toBe(true);
      const text = await response.text();
      const messages = parseSSEMessages(text);

      const listResponse = messages.find((m) => m.id === 2);
      expect(listResponse).toBeDefined();

      const result = listResponse!.result as Record<string, unknown>;
      const tools = result.tools as Array<{ name: string }>;
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);

      const forgeTool = tools.find((t) => t.name === "forge");
      expect(forgeTool).toBeDefined();
    });
  });

  // --- tools/call tests ---

  describe("tools/call", () => {
    it("should call a tool with credentials from Bearer token", async () => {
      const { sessionId } = await initializeSession(baseUrl, validToken);
      await sendInitializedNotification(baseUrl, validToken, sessionId);

      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          ...MCP_HEADERS,
          Authorization: `Bearer ${validToken}`,
          "mcp-session-id": sessionId,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "forge",
            arguments: { resource: "servers", action: "list" },
          },
          id: 3,
        }),
      });

      expect(response.ok).toBe(true);
      const text = await response.text();
      const messages = parseSSEMessages(text);

      const callResponse = messages.find((m) => m.id === 3);
      expect(callResponse).toBeDefined();

      // Verify executeToolWithCredentials was called with correct credentials
      expect(executeToolWithCredentials).toHaveBeenCalledWith(
        "forge",
        { resource: "servers", action: "list" },
        { apiToken: validToken },
      );
    });

    it("should handle tool execution errors gracefully", async () => {
      const { sessionId } = await initializeSession(baseUrl, validToken);
      await sendInitializedNotification(baseUrl, validToken, sessionId);

      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          ...MCP_HEADERS,
          Authorization: `Bearer ${validToken}`,
          "mcp-session-id": sessionId,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "failing_tool",
            arguments: {},
          },
          id: 4,
        }),
      });

      expect(response.ok).toBe(true);
      const text = await response.text();
      const messages = parseSSEMessages(text);

      const callResponse = messages.find((m) => m.id === 4);
      expect(callResponse).toBeDefined();

      const result = callResponse!.result as Record<string, unknown>;
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content).toBeDefined();

      const errorContent = content.find((c) => c.text?.includes("Error"));
      expect(errorContent).toBeDefined();
      expect(errorContent!.text).toContain("Tool execution failed");
    });
  });

  // --- Multiple sessions ---

  describe("multiple sessions", () => {
    it("should support multiple concurrent sessions with different tokens", async () => {
      const tokenA = "token-client-A";
      const tokenB = "token-client-B";

      const sessionA = await initializeSession(baseUrl, tokenA);
      const sessionB = await initializeSession(baseUrl, tokenB);

      expect(sessionA.sessionId).not.toBe(sessionB.sessionId);

      await sendInitializedNotification(baseUrl, tokenA, sessionA.sessionId);
      await sendInitializedNotification(baseUrl, tokenB, sessionB.sessionId);

      // Call tool on session A
      const responseA = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          ...MCP_HEADERS,
          Authorization: `Bearer ${tokenA}`,
          "mcp-session-id": sessionA.sessionId,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "forge",
            arguments: { resource: "servers", action: "list" },
          },
          id: 10,
        }),
      });
      expect(responseA.ok).toBe(true);
      await responseA.text();

      // Call tool on session B
      const responseB = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          ...MCP_HEADERS,
          Authorization: `Bearer ${tokenB}`,
          "mcp-session-id": sessionB.sessionId,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "forge",
            arguments: { resource: "sites", action: "list" },
          },
          id: 11,
        }),
      });
      expect(responseB.ok).toBe(true);
      await responseB.text();

      // Verify both were called with correct credentials
      expect(executeToolWithCredentials).toHaveBeenCalledWith(
        "forge",
        { resource: "servers", action: "list" },
        { apiToken: tokenA },
      );
      expect(executeToolWithCredentials).toHaveBeenCalledWith(
        "forge",
        { resource: "sites", action: "list" },
        { apiToken: tokenB },
      );
    });
  });
});

// --------------------------------------------------------------------------
// Full server integration test (combining health + MCP routes)
// --------------------------------------------------------------------------
describe("Full server integration", () => {
  let server: HttpServer;
  let baseUrl: string;
  let sessions: SessionManager;

  const validToken = "integration-test-token-5678";

  beforeAll(async () => {
    const ctx = await createTestServer();
    server = ctx.server;
    baseUrl = ctx.baseUrl;
    sessions = ctx.sessions;
  });

  afterAll(async () => {
    await closeTestServer(server, sessions);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should serve health check alongside MCP", async () => {
    // Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    expect(healthRes.status).toBe(200);
    expect(await healthRes.json()).toEqual({ status: "ok" });

    // Service info
    const infoRes = await fetch(`${baseUrl}/`);
    expect(infoRes.status).toBe(200);
    const info = await infoRes.json();
    expect(info.service).toBe("forge-mcp");

    // MCP initialize
    const { sessionId, messages } = await initializeSession(baseUrl, validToken);
    expect(sessionId).toBeTruthy();
    expect(messages.length).toBeGreaterThan(0);
  });

  it("should complete a full MCP session: init → notif → tool call", async () => {
    // 1. Initialize
    const { sessionId } = await initializeSession(baseUrl, validToken);
    expect(sessionId).toBeTruthy();

    // 2. Initialized notification
    const notifStatus = await sendInitializedNotification(baseUrl, validToken, sessionId);
    expect(notifStatus).toBe(202);

    // 3. Tool call
    const response = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: {
        ...MCP_HEADERS,
        Authorization: `Bearer ${validToken}`,
        "mcp-session-id": sessionId,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: "forge",
          arguments: { resource: "user", action: "get" },
        },
        id: 100,
      }),
    });

    expect(response.ok).toBe(true);
    const text = await response.text();
    const messages = parseSSEMessages(text);
    const toolResult = messages.find((m) => m.id === 100);
    expect(toolResult).toBeDefined();

    expect(executeToolWithCredentials).toHaveBeenCalledWith(
      "forge",
      { resource: "user", action: "get" },
      { apiToken: validToken },
    );
  });
});

describe("createMcpRequestHandler", () => {
  it("should return a function that delegates to handleMcpRequest", () => {
    const sessions = new SessionManager({ ttl: 0 });
    const handler = createMcpRequestHandler(sessions);
    expect(typeof handler).toBe("function");
    sessions.closeAll();
  });
});
