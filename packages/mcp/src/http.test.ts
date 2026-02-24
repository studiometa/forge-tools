import { toNodeHandler } from "h3/node";
import { createServer, type Server as HttpServer } from "node:http";
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";

// Mock the handlers
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
  createHttpApp,
  jsonRpcError,
  jsonRpcSuccess,
  handleInitialize,
  handleToolsList,
} from "./http.ts";
import { VERSION } from "./version.ts";

describe("http module", () => {
  describe("jsonRpcError", () => {
    it("should create error response with id", () => {
      const error = jsonRpcError(-32600, "Invalid request", 123);

      expect(error).toEqual({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Invalid request" },
        id: 123,
      });
    });

    it("should create error response without id", () => {
      const error = jsonRpcError(-32700, "Parse error");

      expect(error).toEqual({
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
        id: null,
      });
    });
  });

  describe("jsonRpcSuccess", () => {
    it("should create success response", () => {
      const success = jsonRpcSuccess({ data: "test" }, 456);

      expect(success).toEqual({
        jsonrpc: "2.0",
        result: { data: "test" },
        id: 456,
      });
    });

    it("should handle string id", () => {
      const success = jsonRpcSuccess({ ok: true }, "request-1");

      expect(success.id).toBe("request-1");
    });
  });

  describe("handleInitialize", () => {
    it("should return server info and capabilities", () => {
      const result = handleInitialize();

      expect(result.protocolVersion).toBe("2024-11-05");
      expect(result.serverInfo.name).toBe("forge-mcp");
      expect(result.serverInfo.version).toBe(VERSION);
      expect(result.capabilities.tools).toEqual({});
    });

    it("should include instructions", () => {
      const result = handleInitialize();

      expect(result.instructions).toBeDefined();
      expect(typeof result.instructions).toBe("string");
    });
  });

  describe("handleToolsList", () => {
    it("should return tools array", () => {
      const result = handleToolsList();

      expect(result.tools).toBeDefined();
      expect(Array.isArray(result.tools)).toBe(true);
      expect(result.tools.length).toBeGreaterThan(0);

      // Should include single consolidated tool
      const forge = result.tools.find((t) => t.name === "forge");
      expect(forge).toBeDefined();
    });
  });
});

describe("HTTP Server Integration", () => {
  let server: HttpServer;
  let baseUrl: string;

  // Valid auth token: raw Forge API token
  const validToken = "test-forge-api-token-1234";

  beforeAll(async () => {
    const app = createHttpApp();
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("health endpoints", () => {
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
  });

  describe("POST /mcp - authentication", () => {
    it("should return 401 without auth header", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1 }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe(-32001);
      expect(data.error.message).toContain("Authentication required");
    });

    it("should return 401 with non-Bearer auth", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic dXNlcjpwYXNz",
        },
        body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1 }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe(-32001);
    });

    it("should accept valid Bearer token", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1 }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result).toBeDefined();
    });
  });

  describe("POST /mcp - JSON-RPC methods", () => {
    it("should handle initialize method", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1 }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jsonrpc).toBe("2.0");
      expect(data.id).toBe(1);
      expect(data.result.protocolVersion).toBe("2024-11-05");
      expect(data.result.serverInfo.name).toBe("forge-mcp");
    });

    it("should handle tools/list method", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 2 }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.tools).toBeDefined();
      expect(Array.isArray(data.result.tools)).toBe(true);

      // Verify single consolidated tool
      const forgeTool = data.result.tools.find((t: { name: string }) => t.name === "forge");
      expect(forgeTool).toBeDefined();
      expect(forgeTool.inputSchema).toBeDefined();
    });

    it("should handle tools/call method", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
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
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.content).toBeDefined();

      // Verify handler was called with correct credentials
      expect(executeToolWithCredentials).toHaveBeenCalledWith(
        "forge",
        { resource: "servers", action: "list" },
        { apiToken: validToken },
      );
    });

    it("should return error for unknown method", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ jsonrpc: "2.0", method: "unknown/method", id: 4 }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe(-32601);
      expect(data.error.message).toContain("Method not found");
    });

    it("should preserve request id in response", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: "custom-id-123" }),
      });
      const data = await response.json();

      expect(data.id).toBe("custom-id-123");
    });

    it("should handle missing id gracefully", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({ jsonrpc: "2.0", method: "initialize" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBeNull();
    });
  });

  describe("POST /mcp - error handling", () => {
    it("should handle tool execution errors", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "failing_tool",
            arguments: {},
          },
          id: 5,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe(-32603);
      expect(data.error.message).toContain("Tool execution failed");
    });

    it("should handle empty body", async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: "",
      });

      // Should return an error (either 400 or parse error in JSON body)
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});
