import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { getDeploymentLog } from "./get-log.ts";

describe("getDeploymentLog", () => {
  it("should fetch the deployment log", async () => {
    const logContent = "Cloning into '/home/forge/example.com'...\nDone.";

    const ctx = createTestExecutorContext({
      client: {
        get: vi.fn(async () => logContent),
      } as never,
    });

    const result = await getDeploymentLog({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toBe(logContent);
    expect(ctx.client.get as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      "/servers/123/sites/456/deployment/log",
    );
  });

  it("should return empty string log when response is empty", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: vi.fn(async () => ""),
      } as never,
    });

    const result = await getDeploymentLog({ server_id: "1", site_id: "2" }, ctx);

    expect(result.data).toBe("");
  });
});
