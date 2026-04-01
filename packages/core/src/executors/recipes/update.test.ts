import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { updateRecipe } from "./update.ts";

describe("updateRecipe", () => {
  it("should update a recipe and return result", async () => {
    const ctx = createTestExecutorContext({
      client: {
        put: async () =>
          mockDocument(8, "recipes", {
            name: "updated-script",
            user: "forge",
            script: "echo updated",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-06-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await updateRecipe(
      { id: "8", name: "updated-script", user: "forge", script: "echo updated" },
      ctx,
    );

    expect(result.data.id).toBe(8);
    expect(result.data.name).toBe("updated-script");
    expect(result.data.user).toBe("forge");
    expect(result.data.script).toBe("echo updated");
  });
});
