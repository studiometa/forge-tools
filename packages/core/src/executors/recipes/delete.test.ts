import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteRecipe } from "./delete.ts";

describe("deleteRecipe", () => {
  it("should delete a recipe", async () => {
    const deleteMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteRecipe({ id: "8" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/recipes/8");
    expect(result.data).toBeUndefined();
  });
});
