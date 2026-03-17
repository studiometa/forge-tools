import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listRedirectRules } from "./list.ts";

describe("listRedirectRules", () => {
  it("should list redirect rules and format output", async () => {
    const getMock = async () =>
      mockListDocument("redirect-rules", [
        {
          id: 1,
          attributes: {
            from: "/old",
            to: "/new",
            type: "permanent",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          },
        },
      ]);

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listRedirectRules({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => mockListDocument("redirect-rules", []),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await listRedirectRules({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
