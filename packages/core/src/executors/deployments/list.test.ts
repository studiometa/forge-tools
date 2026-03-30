import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listDeployments } from "./list.ts";

describe("listDeployments", () => {
  it("should list deployments and format output", async () => {
    const getMock = async () =>
      mockListDocument("deployments", [
        {
          id: 1,
          attributes: {
            commit: { hash: "abc1234567", author: "John", message: "Update", branch: "main" },
            status: "finished",
            type: "push",
            started_at: "2024-01-01T00:00:00.000000Z",
            ended_at: "2024-01-01T00:05:00.000000Z",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:05:00.000000Z",
          },
        },
        {
          id: 2,
          attributes: {
            commit: { hash: null, author: null, message: null, branch: null },
            status: "failed",
            type: "push",
            started_at: "2024-01-02T00:00:00.000000Z",
            ended_at: "2024-01-02T00:01:00.000000Z",
            created_at: "2024-01-02T00:00:00.000000Z",
            updated_at: "2024-01-02T00:01:00.000000Z",
          },
        },
      ]);

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listDeployments({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(2);
  });

  it("should handle empty deployment list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => mockListDocument("deployments", []),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await listDeployments({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
