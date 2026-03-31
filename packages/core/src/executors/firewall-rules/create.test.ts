import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { createFirewallRule } from "./create.ts";

describe("createFirewallRule", () => {
  it("should create a firewall rule and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () => {},
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createFirewallRule(
      { server_id: "1", name: "Allow SSH", port: "22", type: "allow" },
      ctx,
    );

    expect(result.data).toBeUndefined();
  });
});
