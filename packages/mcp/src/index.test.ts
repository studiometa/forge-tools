import { describe, it, expect, vi } from "vitest";

vi.mock("@modelcontextprotocol/sdk/server/index.js", () => ({
  Server: class MockServer {
    setRequestHandler(_schema: unknown, _handler: unknown) {}
    async connect(_transport: unknown) {}
  },
}));

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: class MockStdioTransport {},
}));

vi.mock("./stdio.ts", () => ({
  getAvailableTools: vi.fn(() => [{ name: "forge", description: "test" }]),
  handleToolCall: vi.fn(async () => ({
    content: [{ type: "text", text: "ok" }],
  })),
}));

describe("forge-mcp stdio", () => {
  it("should be importable", async () => {
    const mod = await import("./index.ts");
    expect(mod).toBeDefined();
  });

  it("should create a stdio server", async () => {
    const { createStdioServer } = await import("./index.ts");
    const server = createStdioServer();
    expect(server).toBeDefined();
  });

  it("should start the stdio server without throwing", async () => {
    const { startStdioServer } = await import("./index.ts");
    await expect(startStdioServer()).resolves.toBeUndefined();
  });
});
