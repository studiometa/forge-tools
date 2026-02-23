import { describe, expect, it } from "vitest";

import type { RedirectRulesResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listRedirectRules } from "./list.ts";

describe("listRedirectRules", () => {
  it("should list redirect rules and format output", async () => {
    const redirect_rules = [{ id: 1, from: "/old", to: "/new", type: "permanent" }];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ redirect_rules }) as RedirectRulesResponse,
      } as never,
    });

    const result = await listRedirectRules({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(1);
    expect(result.text).toContain("/old");
    expect(result.text).toContain("/new");
    expect(result.text).toContain("1 redirect rule(s)");
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ redirect_rules: [] }) as RedirectRulesResponse,
      } as never,
    });

    const result = await listRedirectRules({ server_id: "123", site_id: "456" }, ctx);

    expect(result.data).toHaveLength(0);
    expect(result.text).toContain("No redirect rules");
  });
});
