import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { getDeploymentScript } from "./get-script.ts";

describe("getDeploymentScript", () => {
  it("should return deployment script", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => "cd /home/forge/example.com\nnpm run build",
      } as never,
    });

    const result = await getDeploymentScript({ server_id: 123, site_id: 456 }, ctx);

    expect(result.data).toContain("npm run build");
    expect(result.text).toContain("script");
  });
});
