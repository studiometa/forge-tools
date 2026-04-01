import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deploySite } from "./deploy.ts";

describe("deploySite", () => {
  it("should trigger a deployment", async () => {
    const postMock = vi.fn(async () => {});

    const ctx = createTestExecutorContext({
      client: { post: postMock } as never,
      organizationSlug: "test-org",
    });

    await deploySite({ server_id: "123", site_id: "456" }, ctx);

    expect(postMock).toHaveBeenCalledWith("/orgs/test-org/servers/123/sites/456/deployments", {});
  });
});
