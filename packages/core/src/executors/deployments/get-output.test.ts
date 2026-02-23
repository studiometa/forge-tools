import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { getDeploymentOutput } from "./get-output.ts";

describe("getDeploymentOutput", () => {
  it("should return deployment output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => "Deployment successful\nBuild completed",
      } as never,
    });

    const result = await getDeploymentOutput(
      { server_id: 123, site_id: 456, deployment_id: 789 },
      ctx,
    );

    expect(result.data).toContain("Deployment successful");
    expect(result.text).toContain("output");
  });
});
