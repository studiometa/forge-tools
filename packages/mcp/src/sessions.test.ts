import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

import { SessionManager } from "./sessions.ts";

/**
 * Create a mock transport with a given session ID.
 */
function createMockTransport(sessionId: string) {
  return {
    sessionId,
    close: vi.fn(async () => {}),
    handleRequest: async () => {},
  } as unknown as import("@modelcontextprotocol/sdk/server/streamableHttp.js").StreamableHTTPServerTransport;
}

/**
 * Create a mock MCP server.
 */
function createMockServer() {
  return {
    close: vi.fn(async () => {}),
  } as unknown as import("@modelcontextprotocol/sdk/server/index.js").Server;
}

describe("SessionManager", () => {
  // Disable TTL by default to keep tests deterministic
  const noTtl = { ttl: 0 };

  it("should start empty", () => {
    const manager = new SessionManager(noTtl);
    expect(manager.size).toBe(0);
  });

  it("should register and retrieve a session", () => {
    const manager = new SessionManager(noTtl);
    const transport = createMockTransport("session-1");
    const server = createMockServer();

    manager.register(transport, server);

    expect(manager.size).toBe(1);
    const session = manager.get("session-1");
    expect(session).toBeDefined();
    expect(session!.transport).toBe(transport);
    expect(session!.server).toBe(server);
    expect(session!.createdAt).toBeGreaterThan(0);
    expect(session!.lastActiveAt).toBeGreaterThanOrEqual(session!.createdAt);
  });

  it("should return undefined for unknown session ID", () => {
    const manager = new SessionManager(noTtl);
    expect(manager.get("nonexistent")).toBeUndefined();
  });

  it("should not register if transport has no session ID", () => {
    const manager = new SessionManager(noTtl);
    const transport = createMockTransport(undefined as unknown as string);
    const server = createMockServer();

    manager.register(transport, server);

    expect(manager.size).toBe(0);
  });

  it("should remove a session and close its transport + server", async () => {
    const manager = new SessionManager(noTtl);
    const transport = createMockTransport("to-remove");
    const server = createMockServer();

    manager.register(transport, server);
    expect(manager.size).toBe(1);

    await manager.remove("to-remove");

    expect(manager.size).toBe(0);
    expect(manager.get("to-remove")).toBeUndefined();
    expect(transport.close).toHaveBeenCalled();
    expect(server.close).toHaveBeenCalled();
  });

  it("should handle removing nonexistent session gracefully", async () => {
    const manager = new SessionManager(noTtl);
    await manager.remove("does-not-exist");
    expect(manager.size).toBe(0);
  });

  it("should manage multiple sessions independently", () => {
    const manager = new SessionManager(noTtl);

    manager.register(createMockTransport("a"), createMockServer());
    manager.register(createMockTransport("b"), createMockServer());
    manager.register(createMockTransport("c"), createMockServer());

    expect(manager.size).toBe(3);
    expect(manager.get("a")).toBeDefined();
    expect(manager.get("b")).toBeDefined();
    expect(manager.get("c")).toBeDefined();
  });

  it("should close all sessions and call close on each", async () => {
    const manager = new SessionManager(noTtl);
    const transports: Array<ReturnType<typeof createMockTransport>> = [];
    const servers: Array<ReturnType<typeof createMockServer>> = [];

    for (const id of ["x", "y", "z"]) {
      const transport = createMockTransport(id);
      const server = createMockServer();
      transports.push(transport);
      servers.push(server);
      manager.register(transport, server);
    }

    expect(manager.size).toBe(3);

    await manager.closeAll();

    expect(manager.size).toBe(0);
    for (const t of transports) expect(t.close).toHaveBeenCalled();
    for (const s of servers) expect(s.close).toHaveBeenCalled();
  });
});

describe("SessionManager TTL", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should refresh lastActiveAt on get", () => {
    const manager = new SessionManager({ ttl: 0 });
    manager.register(createMockTransport("s1"), createMockServer());

    const before = manager.get("s1")!.lastActiveAt;

    vi.advanceTimersByTime(1000);
    const session = manager.get("s1");

    expect(session!.lastActiveAt).toBeGreaterThan(before);
  });

  it("should sweep expired sessions", () => {
    const manager = new SessionManager({ ttl: 5000, sweepInterval: 100_000 });

    const transport = createMockTransport("expired");
    const server = createMockServer();
    manager.register(transport, server);

    expect(manager.size).toBe(1);

    // Advance past TTL
    vi.advanceTimersByTime(6000);

    const reaped = manager.sweep();

    expect(reaped).toBe(1);
    // Session removed from map immediately
    expect(manager.size).toBe(0);
  });

  it("should not sweep active sessions", () => {
    const manager = new SessionManager({ ttl: 5000, sweepInterval: 100_000 });

    manager.register(createMockTransport("active"), createMockServer());

    // Access it to refresh lastActiveAt
    vi.advanceTimersByTime(3000);
    manager.get("active");

    // Now advance another 3s — total 6s from creation, but only 3s from last access
    vi.advanceTimersByTime(3000);

    const reaped = manager.sweep();
    expect(reaped).toBe(0);
    expect(manager.size).toBe(1);
  });

  it("should auto-sweep on interval", () => {
    const manager = new SessionManager({ ttl: 1000, sweepInterval: 500 });

    manager.register(createMockTransport("auto"), createMockServer());

    expect(manager.size).toBe(1);

    // Advance past TTL + sweep interval
    vi.advanceTimersByTime(1500);

    // The sweep timer should have fired and cleaned up
    expect(manager.size).toBe(0);
  });

  it("should not sweep when ttl is 0", () => {
    const manager = new SessionManager({ ttl: 0 });

    manager.register(createMockTransport("forever"), createMockServer());

    vi.advanceTimersByTime(999_999);

    const reaped = manager.sweep();
    expect(reaped).toBe(0);
    expect(manager.size).toBe(1);
  });

  it("should stop sweep timer on closeAll", async () => {
    const manager = new SessionManager({ ttl: 1000, sweepInterval: 500 });

    manager.register(createMockTransport("s1"), createMockServer());

    await manager.closeAll();

    // Register a new session after closeAll
    manager.register(createMockTransport("s2"), createMockServer());

    // Advance time — sweep timer was cleared, so no auto-cleanup
    vi.advanceTimersByTime(5000);

    expect(manager.size).toBe(1);
    expect(manager.get("s2")).toBeDefined();
  });

  it("should not create sweep timer when ttl is 0", () => {
    const manager = new SessionManager({ ttl: 0 });
    expect((manager as unknown as { sweepTimer: unknown }).sweepTimer).toBeUndefined();
    manager.closeAll();
  });

  it("should use DEFAULT_TTL and DEFAULT_SWEEP_INTERVAL when created with no options", () => {
    const manager = new SessionManager();
    expect((manager as unknown as { ttl: number }).ttl).toBeGreaterThan(0);
    expect((manager as unknown as { sweepTimer: unknown }).sweepTimer).toBeDefined();
    manager.closeAll();
  });

  it("should use custom sweepInterval when provided", () => {
    const manager = new SessionManager({ ttl: 30000, sweepInterval: 1000 });
    expect((manager as unknown as { sweepTimer: unknown }).sweepTimer).toBeDefined();
    manager.closeAll();
  });

  it("should sweep only expired sessions in a mixed set", () => {
    const manager = new SessionManager({ ttl: 5000, sweepInterval: 100_000 });

    manager.register(createMockTransport("old"), createMockServer());

    vi.advanceTimersByTime(4000);

    // Add a fresh one
    manager.register(createMockTransport("new"), createMockServer());

    // Advance 2 more seconds — "old" is 6s idle, "new" is 2s
    vi.advanceTimersByTime(2000);

    const reaped = manager.sweep();
    expect(reaped).toBe(1);
    expect(manager.size).toBe(1);
    expect(manager.get("old")).toBeUndefined();
    expect(manager.get("new")).toBeDefined();
  });
});
