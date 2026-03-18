import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { updateDeploymentScript } from "./update-script.ts";

describe("updateDeploymentScript", () => {
  it("should update deployment script", async () => {
    const putMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({
      client: { put: putMock } as never,
      organizationSlug: "test-org",
    });

    await updateDeploymentScript(
      { server_id: "123", site_id: "456", content: "npm run build" },
      ctx,
    );

    expect(putMock).toHaveBeenCalledWith(
      "/orgs/test-org/servers/123/sites/456/deployments/script",
      { content: "npm run build" },
    );
  });
});
