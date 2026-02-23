import { describe, expect, it } from "vitest";

import type { DeploymentsResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listDeployments } from "./list.ts";

describe("listDeployments", () => {
  it("should list deployments and format output", async () => {
    const deployments = [
      { id: 1, status: "finished", commit_hash: "abc1234567", started_at: "2024-01-01" },
      { id: 2, status: "failed", commit_hash: null, started_at: "2024-01-02" },
    ];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ deployments }) as DeploymentsResponse,
      } as never,
    });

    const result = await listDeployments({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(2);
    expect(result.text).toContain("2 deployment(s)");
    expect(result.text).toContain("abc1234");
    expect(result.text).toContain("no commit");
  });

  it("should handle empty deployment list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ deployments: [] }) as DeploymentsResponse,
      } as never,
    });

    const result = await listDeployments({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(0);
    expect(result.text).toContain("No deployments found");
  });
});
