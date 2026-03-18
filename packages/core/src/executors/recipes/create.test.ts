import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createRecipe } from "./create.ts";

describe("createRecipe", () => {
  it("should create a recipe and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(8, "recipes", {
            name: "deploy-script",
            user: "root",
            script: "echo hello",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createRecipe(
      { name: "deploy-script", user: "root", script: "echo hello" },
      ctx,
    );

    expect(result.data.name).toBe("deploy-script");
  });
});
