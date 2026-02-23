import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "./context.ts";

describe("createTestExecutorContext", () => {
  it("should create a context with a proxy client", () => {
    const ctx = createTestExecutorContext();
    expect(ctx.client).toBeDefined();
  });

  it("should throw when proxy client methods are called without mock", () => {
    const ctx = createTestExecutorContext();
    expect(() => ctx.client.get("/test")).toThrow("called without mock");
  });

  it("should accept overrides", () => {
    const mockClient = {
      get: async () => ({}),
    } as never;

    const ctx = createTestExecutorContext({ client: mockClient });
    expect(ctx.client).toBe(mockClient);
  });
});
