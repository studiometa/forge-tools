import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleServers } from "./servers.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          servers: [],
          server: {
            id: 1,
            name: "web-1",
            provider: "ocean2",
            region: "ams3",
            ip_address: "1.2.3.4",
            is_ready: true,
            created_at: "2024-01-01",
            php_version: "php83",
            ubuntu_version: "22.04",
          },
        }),
        post: async () => ({ server: { id: 1, name: "web-1", is_ready: false } }),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleServers", () => {
  it("should list servers", async () => {
    const result = await handleServers(
      "list",
      { resource: "servers", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
  });

  it("should get a server", async () => {
    const result = await handleServers(
      "get",
      { resource: "servers", action: "get", id: "123" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("web-1");
  });

  it("should require id for get", async () => {
    const result = await handleServers(
      "get",
      { resource: "servers", action: "get" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("id");
  });

  it("should reboot a server", async () => {
    const result = await handleServers(
      "reboot",
      { resource: "servers", action: "reboot", id: "123" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("reboot");
  });

  it("should handle unknown action", async () => {
    const result = await handleServers(
      "unknown",
      { resource: "servers", action: "unknown" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });

  it("should reject path traversal in id", async () => {
    const result = await handleServers(
      "get",
      { resource: "servers", action: "get", id: "../etc/passwd" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Invalid");
  });
});
