import { describe, expect, it } from "vitest";

import type { FirewallRuleResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getFirewallRule } from "./get.ts";

describe("getFirewallRule", () => {
  it("should get a firewall rule and format output", async () => {
    const rule = {
      id: 3,
      name: "Allow SSH",
      port: "22",
      type: "allow",
      ip_address: "0.0.0.0",
      status: "installed",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ rule }) as FirewallRuleResponse,
      } as never,
    });

    const result = await getFirewallRule({ server_id: "1", id: "3" }, ctx);

    expect(result.data.name).toBe("Allow SSH");
    expect(result.text).toContain("Allow SSH");
    expect(result.text).toContain("22");
    expect(result.text).toContain("installed");
  });
});
