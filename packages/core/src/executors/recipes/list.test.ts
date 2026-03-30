import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listRecipes } from "./list.ts";

describe("listRecipes", () => {
  it("should list recipes", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () =>
          mockListDocument("recipes", [
            {
              id: 1,
              attributes: {
                name: "Clear caches",
                user: "root",
                script: "php artisan cache:clear",
                created_at: "2024-01-01T00:00:00.000000Z",
                updated_at: "2024-01-01T00:00:00.000000Z",
              },
            },
          ]),
      } as never,
      organizationSlug: "test-org",
    });
    const result = await listRecipes({} as Record<string, never>, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("recipes", []) } as never,
      organizationSlug: "test-org",
    });
    const result = await listRecipes({} as Record<string, never>, ctx);
    expect(result.data).toHaveLength(0);
  });
});
