import { describe, it, expect } from "vitest";

import { SessionManager } from "./sessions.ts";

/**
 * Create a mock transport with a given session ID.
 */
function createMockTransport(sessionId: string) {
  return {
    sessionId,
    close: async () => {},
    handleRequest: async () => {},
  } as unknown as import("@modelcontextprotocol/sdk/server/streamableHttp.js").StreamableHTTPServerTransport;
}

/**
 * Create a mock MCP server.
 */
function createMockServer() {
  return {
    close: async () => {},
  } as unknown as import("@modelcontextprotocol/sdk/server/index.js").Server;
}

describe("SessionManager", () => {
  it("should start empty", () => {
    const manager = new SessionManager();
    expect(manager.size).toBe(0);
  });

  it("should register and retrieve a session", () => {
    const manager = new SessionManager();
    const transport = createMockTransport("session-1");
    const server = createMockServer();

    manager.register(transport, server);

    expect(manager.size).toBe(1);
    const session = manager.get("session-1");
    expect(session).toBeDefined();
    expect(session!.transport).toBe(transport);
    expect(session!.server).toBe(server);
    expect(session!.createdAt).toBeGreaterThan(0);
  });

  it("should return undefined for unknown session ID", () => {
    const manager = new SessionManager();
    expect(manager.get("nonexistent")).toBeUndefined();
  });

  it("should not register if transport has no session ID", () => {
    const manager = new SessionManager();
    const transport = createMockTransport(undefined as unknown as string);
    const server = createMockServer();

    manager.register(transport, server);

    expect(manager.size).toBe(0);
  });

  it("should remove a session and close its transport + server", async () => {
    const manager = new SessionManager();
    let transportClosed = false;
    let serverClosed = false;

    const transport = {
      sessionId: "to-remove",
      close: async () => {
        transportClosed = true;
      },
    } as unknown as import("@modelcontextprotocol/sdk/server/streamableHttp.js").StreamableHTTPServerTransport;

    const server = {
      close: async () => {
        serverClosed = true;
      },
    } as unknown as import("@modelcontextprotocol/sdk/server/index.js").Server;

    manager.register(transport, server);
    expect(manager.size).toBe(1);

    await manager.remove("to-remove");

    expect(manager.size).toBe(0);
    expect(manager.get("to-remove")).toBeUndefined();
    expect(transportClosed).toBe(true);
    expect(serverClosed).toBe(true);
  });

  it("should handle removing nonexistent session gracefully", async () => {
    const manager = new SessionManager();
    await manager.remove("does-not-exist");
    expect(manager.size).toBe(0);
  });

  it("should manage multiple sessions independently", () => {
    const manager = new SessionManager();

    manager.register(createMockTransport("a"), createMockServer());
    manager.register(createMockTransport("b"), createMockServer());
    manager.register(createMockTransport("c"), createMockServer());

    expect(manager.size).toBe(3);
    expect(manager.get("a")).toBeDefined();
    expect(manager.get("b")).toBeDefined();
    expect(manager.get("c")).toBeDefined();
  });

  it("should close all sessions and call close on each", async () => {
    const manager = new SessionManager();
    const closed: string[] = [];

    for (const id of ["x", "y", "z"]) {
      const transport = {
        sessionId: id,
        close: async () => {
          closed.push(`transport-${id}`);
        },
      } as unknown as import("@modelcontextprotocol/sdk/server/streamableHttp.js").StreamableHTTPServerTransport;

      const server = {
        close: async () => {
          closed.push(`server-${id}`);
        },
      } as unknown as import("@modelcontextprotocol/sdk/server/index.js").Server;

      manager.register(transport, server);
    }

    expect(manager.size).toBe(3);

    await manager.closeAll();

    expect(manager.size).toBe(0);
    expect(closed).toContain("transport-x");
    expect(closed).toContain("transport-y");
    expect(closed).toContain("transport-z");
    expect(closed).toContain("server-x");
    expect(closed).toContain("server-y");
    expect(closed).toContain("server-z");
  });
});
