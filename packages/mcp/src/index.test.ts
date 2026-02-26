import { describe, it, expect, vi, afterEach } from "vitest";

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

  it("should create a stdio server with readOnly option", async () => {
    const { createStdioServer } = await import("./index.ts");
    const server = createStdioServer({ readOnly: true });
    expect(server).toBeDefined();
  });

  it("should start the stdio server without throwing", async () => {
    const { startStdioServer } = await import("./index.ts");
    await expect(startStdioServer()).resolves.toBeUndefined();
  });

  it("should start the stdio server in read-only mode without throwing", async () => {
    const { startStdioServer } = await import("./index.ts");
    await expect(startStdioServer({ readOnly: true })).resolves.toBeUndefined();
  });
});

describe("parseReadOnlyFlag", () => {
  const originalArgv = process.argv;

  afterEach(() => {
    process.argv = originalArgv;
    delete process.env.FORGE_READ_ONLY;
  });

  it("should return false when no flag or env var is set", async () => {
    process.argv = ["node", "index.js"];
    delete process.env.FORGE_READ_ONLY;
    const { parseReadOnlyFlag } = await import("./index.ts");
    expect(parseReadOnlyFlag()).toBe(false);
  });

  it("should return true when --read-only flag is present", async () => {
    process.argv = ["node", "index.js", "--read-only"];
    const { parseReadOnlyFlag } = await import("./index.ts");
    expect(parseReadOnlyFlag()).toBe(true);
  });

  it("should return true when FORGE_READ_ONLY env var is set to true", async () => {
    process.argv = ["node", "index.js"];
    process.env.FORGE_READ_ONLY = "true";
    const { parseReadOnlyFlag } = await import("./index.ts");
    expect(parseReadOnlyFlag()).toBe(true);
  });

  it("should return false when FORGE_READ_ONLY is set to other values", async () => {
    process.argv = ["node", "index.js"];
    process.env.FORGE_READ_ONLY = "false";
    const { parseReadOnlyFlag } = await import("./index.ts");
    expect(parseReadOnlyFlag()).toBe(false);
  });
});
