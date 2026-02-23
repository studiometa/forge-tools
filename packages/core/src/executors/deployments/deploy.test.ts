import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deploySite } from "./deploy.ts";

describe("deploySite", () => {
  it("should trigger a deployment", async () => {
    const postMock = vi.fn(async () => undefined);

    const ctx = createTestExecutorContext({
      client: {
        post: postMock,
      } as never,
    });

    const result = await deploySite({ server_id: 123, site_id: 456 }, ctx);

    expect(postMock).toHaveBeenCalledWith("/servers/123/sites/456/deployment/deploy");
    expect(result.text).toContain("Deployment triggered");
    expect(result.text).toContain("456");
  });
});
