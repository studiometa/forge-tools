import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getDeploymentScript } from "./get-script.ts";

describe("getDeploymentScript", () => {
  it("should return deployment script", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () =>
          mockDocument(1, "deployment-scripts", {
            content: "cd /home/forge/example.com\nnpm run build",
            auto_source: "false",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await getDeploymentScript({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toContain("npm run build");
  });
});
