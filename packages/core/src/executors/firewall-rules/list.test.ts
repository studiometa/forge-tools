import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listFirewallRules } from "./list.ts";

describe("listFirewallRules", () => {
  it("should list firewall rules", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () =>
          mockListDocument("firewall-rules", [
            {
              id: 1,
              attributes: {
                name: "HTTP",
                port: "80",
                type: "allow",
                ip_address: "",
                status: "installed",
                created_at: "2024-01-01T00:00:00.000000Z",
                updated_at: "2024-01-01T00:00:00.000000Z",
              },
            },
          ]),
      } as never,
      organizationSlug: "test-org",
    });
    const result = await listFirewallRules({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("firewall-rules", []) } as never,
      organizationSlug: "test-org",
    });
    const result = await listFirewallRules({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(0);
  });
});
