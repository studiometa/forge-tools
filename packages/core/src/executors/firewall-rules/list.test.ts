import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { listFirewallRules } from "./list.ts";

describe("listFirewallRules", () => {
  it("should list firewall rules", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({
          rules: [{ id: 1, name: "HTTP", port: 80, ip_address: "", status: "installed" }],
        }),
      } as never,
    });
    const result = await listFirewallRules({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => ({ rules: [] }) } as never,
    });
    const result = await listFirewallRules({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(0);
  });
});
