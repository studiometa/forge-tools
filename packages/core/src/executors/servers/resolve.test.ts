import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { resolveServers } from "./resolve.ts";

const mockServers = [
  { id: 1, name: "prod-web-1" },
  { id: 2, name: "prod-web-2" },
  { id: 3, name: "staging-web-1" },
];

function createCtx() {
  return createTestExecutorContext({
    client: {
      get: async () => ({ servers: mockServers }),
    } as never,
  });
}

describe("resolveServers", () => {
  it("should return partial matches", async () => {
    const result = await resolveServers({ query: "prod" }, createCtx());
    expect(result.data.query).toBe("prod");
    expect(result.data.total).toBe(2);
    expect(result.data.matches).toHaveLength(2);
    expect(result.data.matches[0]!.name).toBe("prod-web-1");
    expect(result.data.matches[1]!.name).toBe("prod-web-2");
  });

  it("should return exact match as single result", async () => {
    const result = await resolveServers({ query: "prod-web-1" }, createCtx());
    expect(result.data.total).toBe(1);
    expect(result.data.matches).toHaveLength(1);
    expect(result.data.matches[0]!.id).toBe(1);
    expect(result.data.matches[0]!.name).toBe("prod-web-1");
  });

  it("should return empty for no matches", async () => {
    const result = await resolveServers({ query: "nonexistent" }, createCtx());
    expect(result.data.total).toBe(0);
    expect(result.data.matches).toHaveLength(0);
  });

  it("should be case insensitive", async () => {
    const result = await resolveServers({ query: "PROD" }, createCtx());
    expect(result.data.total).toBe(2);
    expect(result.data.matches[0]!.name).toBe("prod-web-1");
  });

  it("should return partial matches when multiple exact-like names exist", async () => {
    const ctxWithDupes = createTestExecutorContext({
      client: {
        get: async () => ({
          servers: [
            { id: 1, name: "prod-web-1" },
            { id: 2, name: "prod-web-1" },
          ],
        }),
      } as never,
    });
    // Two exact matches → fall through to partial match
    const result = await resolveServers({ query: "prod-web-1" }, ctxWithDupes);
    expect(result.data.total).toBe(2);
    expect(result.data.matches).toHaveLength(2);
  });
});
