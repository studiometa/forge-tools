import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { updateNginxConfig } from "./update.ts";

describe("updateNginxConfig", () => {
  it("should update nginx configuration", async () => {
    const putMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { put: putMock } as never });

    const result = await updateNginxConfig(
      { server_id: "1", site_id: "2", content: "server { listen 80; }" },
      ctx,
    );

    expect(putMock).toHaveBeenCalledWith("/servers/1/sites/2/nginx", {
      content: "server { listen 80; }",
    });
    expect(result.data).toBeUndefined();
  });
});
