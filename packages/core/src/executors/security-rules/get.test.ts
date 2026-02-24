import { describe, expect, it } from "vitest";

import type { SecurityRuleResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getSecurityRule } from "./get.ts";

describe("getSecurityRule", () => {
  it("should get a security rule and format output", async () => {
    const security_rule = {
      id: 11,
      name: "Restrict Admin",
      path: "/admin",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ security_rule }) as SecurityRuleResponse,
      } as never,
    });

    const result = await getSecurityRule({ server_id: "1", site_id: "2", id: "11" }, ctx);

    expect(result.data.name).toBe("Restrict Admin");
    expect(result.text).toContain("Restrict Admin");
    expect(result.text).toContain("/admin");
  });
});
