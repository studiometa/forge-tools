import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getRecipe } from "./get.ts";

describe("getRecipe", () => {
  it("should get a recipe and format output", async () => {
    const getMock = async () =>
      mockDocument(8, "recipes", {
        name: "deploy-script",
        user: "root",
        script: "echo hello",
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getRecipe({ id: "8" }, ctx);

    expect(result.data.name).toBe("deploy-script");
  });
});
