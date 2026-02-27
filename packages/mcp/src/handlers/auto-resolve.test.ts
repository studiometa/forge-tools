import { describe, expect, it } from "vitest";
import { autoResolveIds } from "./auto-resolve.ts";
import type { CommonArgs } from "./types.ts";
import type { ExecutorContext } from "@studiometa/forge-core";

function createMockCtx(
  servers: Array<{ id: number; name: string }> = [],
  sites: Array<{ id: number; name: string }> = [],
): ExecutorContext {
  return {
    client: {
      get: async (url: string) => {
        if (url === "/servers") return { servers };
        if (url.match(/\/servers\/\d+\/sites$/)) return { sites };
        return {};
      },
    } as never,
  };
}

describe("autoResolveIds", () => {
  it("should pass through numeric server_id unchanged (no API call)", async () => {
    const ctx = createMockCtx(); // empty — would fail if called
    const args: CommonArgs = { resource: "sites", action: "list", server_id: "123" };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.args.server_id).toBe("123");
    }
  });

  it("should pass through numeric site_id unchanged", async () => {
    const ctx = createMockCtx();
    const args: CommonArgs = {
      resource: "env",
      action: "get",
      server_id: "1",
      site_id: "10",
    };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.args.server_id).toBe("1");
      expect(result.args.site_id).toBe("10");
    }
  });

  it("should resolve non-numeric server_id with exact match", async () => {
    const ctx = createMockCtx([{ id: 42, name: "prod-server" }]);
    const args: CommonArgs = { resource: "sites", action: "list", server_id: "prod-server" };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.args.server_id).toBe("42");
    }
  });

  it("should return error when non-numeric server_id has no match", async () => {
    const ctx = createMockCtx([{ id: 1, name: "other-server" }]);
    const args: CommonArgs = { resource: "sites", action: "list", server_id: "nonexistent" };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.isError).toBe(true);
      expect(result.error.content[0]!.text).toContain('No server matching "nonexistent"');
    }
  });

  it("should return error with match list when server_id is ambiguous (multiple matches)", async () => {
    const ctx = createMockCtx([
      { id: 1, name: "prod-web" },
      { id: 2, name: "prod-worker" },
    ]);
    const args: CommonArgs = { resource: "sites", action: "list", server_id: "prod" };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.isError).toBe(true);
      const text = result.error.content[0]!.text;
      expect(text).toContain('Ambiguous server name "prod"');
      expect(text).toContain("2 matches");
      expect(text).toContain("prod-web");
      expect(text).toContain("prod-worker");
    }
  });

  it("should resolve non-numeric site_id after server_id", async () => {
    const ctx = createMockCtx([{ id: 1, name: "my-server" }], [{ id: 99, name: "example.com" }]);
    const args: CommonArgs = {
      resource: "env",
      action: "get",
      server_id: "1",
      site_id: "example.com",
    };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.args.server_id).toBe("1");
      expect(result.args.site_id).toBe("99");
    }
  });

  it("should return error when non-numeric site_id has no match", async () => {
    const ctx = createMockCtx([], [{ id: 10, name: "other.com" }]);
    const args: CommonArgs = {
      resource: "env",
      action: "get",
      server_id: "1",
      site_id: "nonexistent.com",
    };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.isError).toBe(true);
      expect(result.error.content[0]!.text).toContain('No site matching "nonexistent.com"');
    }
  });

  it("should return error with match list when site_id is ambiguous (multiple matches)", async () => {
    const ctx = createMockCtx(
      [],
      [
        { id: 10, name: "app.example.com" },
        { id: 11, name: "api.example.com" },
      ],
    );
    const args: CommonArgs = {
      resource: "env",
      action: "get",
      server_id: "1",
      site_id: "example",
    };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.isError).toBe(true);
      const text = result.error.content[0]!.text;
      expect(text).toContain('Ambiguous site name "example"');
      expect(text).toContain("app.example.com");
      expect(text).toContain("api.example.com");
    }
  });

  it("should return error when site_id is non-numeric but server_id is missing", async () => {
    const ctx = createMockCtx();
    const args: CommonArgs = {
      resource: "env",
      action: "get",
      site_id: "example.com",
    };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.isError).toBe(true);
      expect(result.error.content[0]!.text).toContain(
        "Cannot resolve site name without a server_id",
      );
    }
  });

  it("should resolve both non-numeric server_id and site_id", async () => {
    const ctx = createMockCtx([{ id: 5, name: "prod" }], [{ id: 20, name: "example.com" }]);
    const args: CommonArgs = {
      resource: "env",
      action: "get",
      server_id: "prod",
      site_id: "example.com",
    };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.args.server_id).toBe("5");
      expect(result.args.site_id).toBe("20");
    }
  });

  it("should skip auto-resolve for resolve action", async () => {
    // ctx with no servers — would error if API was called
    const ctx = createMockCtx();
    const args: CommonArgs = {
      resource: "servers",
      action: "resolve",
      server_id: "prod",
    };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // server_id should remain unchanged (non-numeric)
      expect(result.args.server_id).toBe("prod");
    }
  });

  it("should pass through unchanged when no server_id or site_id present", async () => {
    const ctx = createMockCtx();
    const args: CommonArgs = { resource: "servers", action: "list" };
    const result = await autoResolveIds(args, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.args.server_id).toBeUndefined();
      expect(result.args.site_id).toBeUndefined();
    }
  });
});
