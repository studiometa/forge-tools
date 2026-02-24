import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteRecipe } from "./delete.ts";

describe("deleteRecipe", () => {
  it("should delete a recipe", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteRecipe({ id: "8" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/recipes/8");
    expect(result.data).toBeUndefined();
  });
});
