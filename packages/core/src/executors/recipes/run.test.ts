import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { runRecipe } from "./run.ts";

describe("runRecipe", () => {
  it("should run a recipe on servers", async () => {
    const postMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { post: postMock } as never });

    const result = await runRecipe({ id: "8", servers: [1, 2, 3] }, ctx);

    expect(postMock).toHaveBeenCalledWith("/recipes/8/run", {
      servers: [1, 2, 3],
    });
    expect(result.data).toBeUndefined();
  });
});
