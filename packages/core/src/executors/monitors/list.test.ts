import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listMonitors } from "./list.ts";

describe("listMonitors", () => {
  it("should list monitors and format output", async () => {
    const getMock = async () =>
      mockListDocument("monitors", [
        {
          id: 1,
          attributes: {
            type: "disk",
            operator: "gte",
            threshold: 80,
            minutes: 5,
            notify: "forge@example.com",
            status: "active",
            state: "OK",
            state_changed_at: "2024-01-01T00:00:00.000000Z",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          },
        },
      ]);

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listMonitors({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => mockListDocument("monitors", []),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await listMonitors({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
