import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { updateEnv } from "./update.ts";

describe("updateEnv", () => {
  it("should update environment variables", async () => {
    const putMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { put: putMock } as never });

    const result = await updateEnv(
      { server_id: "1", site_id: "2", content: "APP_ENV=production" },
      ctx,
    );

    expect(putMock).toHaveBeenCalledWith("/servers/1/sites/2/env", {
      content: "APP_ENV=production",
    });
    expect(result.data).toBeUndefined();
    expect(result.text).toContain("updated");
  });
});
