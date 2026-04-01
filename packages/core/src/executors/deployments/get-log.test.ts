import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getDeploymentLog } from "./get-log.ts";

describe("getDeploymentLog", () => {
  it("should fetch the deployment log", async () => {
    const logContent = "Cloning into '/home/forge/example.com'...\nDone.";

    const getMock = vi.fn(async () => mockDocument(1, "deployment-logs", { output: logContent }));

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getDeploymentLog(
      { server_id: "123", site_id: "456", deployment_id: "789" },
      ctx,
    );

    expect(result.data).toBe(logContent);
    expect(getMock).toHaveBeenCalledWith(
      "/orgs/test-org/servers/123/sites/456/deployments/789/log",
    );
  });

  it("should return empty string log when output is empty", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: vi.fn(async () => mockDocument(1, "deployment-logs", { output: "" })),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await getDeploymentLog(
      { server_id: "1", site_id: "2", deployment_id: "3" },
      ctx,
    );

    expect(result.data).toBe("");
  });
});
