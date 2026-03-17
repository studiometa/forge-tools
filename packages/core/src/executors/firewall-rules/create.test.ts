import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createFirewallRule } from "./create.ts";

describe("createFirewallRule", () => {
  it("should create a firewall rule and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(3, "firewall-rules", {
            name: "Allow SSH",
            port: "22",
            type: "allow",
            ip_address: "",
            status: "creating",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createFirewallRule(
      { server_id: "1", name: "Allow SSH", port: "22", type: "allow" },
      ctx,
    );

    expect(result.data.name).toBe("Allow SSH");
  });
});
