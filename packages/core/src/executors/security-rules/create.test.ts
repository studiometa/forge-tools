import { describe, expect, it } from "vitest";

import type { SecurityRuleResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createSecurityRule } from "./create.ts";

describe("createSecurityRule", () => {
  it("should create a security rule and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            security_rule: { id: 11, name: "Restrict Admin" },
          }) as SecurityRuleResponse,
      } as never,
    });

    const result = await createSecurityRule(
      { server_id: "1", site_id: "2", name: "Restrict Admin", path: "/admin" },
      ctx,
    );

    expect(result.data.name).toBe("Restrict Admin");
    expect(result.text).toContain("Restrict Admin");
    expect(result.text).toContain("11");
  });
});
