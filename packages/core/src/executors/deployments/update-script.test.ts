import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { updateDeploymentScript } from "./update-script.ts";

describe("updateDeploymentScript", () => {
  it("should update deployment script", async () => {
    const putMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { put: putMock } as never });

    await updateDeploymentScript(
      { server_id: "123", site_id: "456", content: "npm run build" },
      ctx,
    );

    expect(putMock).toHaveBeenCalledWith("/servers/123/sites/456/deployment/script", {
      content: "npm run build",
    });
  });
});
