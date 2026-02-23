import { describe, expect, it } from "vitest";

import type { SecurityRulesResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listSecurityRules } from "./list.ts";

describe("listSecurityRules", () => {
  it("should list security rules and format output", async () => {
    const security_rules = [{ id: 1, name: "Staging Auth", path: "/admin" }];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ security_rules }) as SecurityRulesResponse,
      } as never,
    });

    const result = await listSecurityRules({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(1);
    expect(result.text).toContain("Staging Auth");
    expect(result.text).toContain("1 security rule(s)");
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ security_rules: [] }) as SecurityRulesResponse,
      } as never,
    });

    const result = await listSecurityRules({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(0);
    expect(result.text).toContain("No security rules");
  });
});
