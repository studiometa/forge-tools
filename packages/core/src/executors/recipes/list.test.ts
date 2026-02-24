import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { listRecipes } from "./list.ts";

describe("listRecipes", () => {
  it("should list recipes", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({
          recipes: [{ id: 1, name: "Clear caches", user: "root" }],
        }),
      } as never,
    });
    const result = await listRecipes({} as Record<string, never>, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => ({ recipes: [] }) } as never,
    });
    const result = await listRecipes({} as Record<string, never>, ctx);
    expect(result.data).toHaveLength(0);
  });
});
