import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { resolveSites } from "./resolve.ts";

const mockSites = [
  { id: 1, name: "example.com" },
  { id: 2, name: "api.example.com" },
  { id: 3, name: "staging.myapp.io" },
];

function createCtx() {
  return createTestExecutorContext({
    client: {
      get: async () => ({ sites: mockSites }),
    } as never,
  });
}

describe("resolveSites", () => {
  it("should return partial matches", async () => {
    const result = await resolveSites({ server_id: "123", query: "example" }, createCtx());
    expect(result.data.query).toBe("example");
    expect(result.data.total).toBe(2);
    expect(result.data.matches).toHaveLength(2);
    expect(result.data.matches[0]!.name).toBe("example.com");
    expect(result.data.matches[1]!.name).toBe("api.example.com");
  });

  it("should return exact match as single result", async () => {
    const result = await resolveSites({ server_id: "123", query: "example.com" }, createCtx());
    expect(result.data.total).toBe(1);
    expect(result.data.matches).toHaveLength(1);
    expect(result.data.matches[0]!.id).toBe(1);
    expect(result.data.matches[0]!.name).toBe("example.com");
  });

  it("should return empty for no matches", async () => {
    const result = await resolveSites({ server_id: "123", query: "nonexistent" }, createCtx());
    expect(result.data.total).toBe(0);
    expect(result.data.matches).toHaveLength(0);
  });

  it("should be case insensitive", async () => {
    const result = await resolveSites({ server_id: "123", query: "EXAMPLE" }, createCtx());
    expect(result.data.total).toBe(2);
  });

  it("should use server_id in the API path", async () => {
    let capturedPath = "";
    const ctx = createTestExecutorContext({
      client: {
        get: async (path: string) => {
          capturedPath = path;
          return { sites: [] };
        },
      } as never,
    });
    await resolveSites({ server_id: "456", query: "test" }, ctx);
    expect(capturedPath).toBe("/servers/456/sites");
  });

  it("should return partial matches when multiple exact-like names exist", async () => {
    const ctxWithDupes = createTestExecutorContext({
      client: {
        get: async () => ({
          sites: [
            { id: 1, name: "example.com" },
            { id: 2, name: "example.com" },
          ],
        }),
      } as never,
    });
    // Two exact matches → fall through to partial match
    const result = await resolveSites({ server_id: "123", query: "example.com" }, ctxWithDupes);
    expect(result.data.total).toBe(2);
    expect(result.data.matches).toHaveLength(2);
  });
});
