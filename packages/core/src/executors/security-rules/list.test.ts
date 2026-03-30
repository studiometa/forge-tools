import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listSecurityRules } from "./list.ts";

describe("listSecurityRules", () => {
  it("should list security rules and format output", async () => {
    const getMock = async () =>
      mockListDocument("security-rules", [
        {
          id: 1,
          attributes: {
            name: "Staging Auth",
            path: "/admin",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          },
        },
      ]);

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listSecurityRules({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => mockListDocument("security-rules", []),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await listSecurityRules({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
