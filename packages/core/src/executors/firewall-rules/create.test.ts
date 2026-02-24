import { describe, expect, it } from "vitest";

import type { FirewallRuleResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createFirewallRule } from "./create.ts";

describe("createFirewallRule", () => {
  it("should create a firewall rule and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            rule: { id: 3, name: "Allow SSH", port: "22" },
          }) as FirewallRuleResponse,
      } as never,
    });

    const result = await createFirewallRule(
      { server_id: "1", name: "Allow SSH", port: "22", type: "allow" },
      ctx,
    );

    expect(result.data.name).toBe("Allow SSH");
  });
});
