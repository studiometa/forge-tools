import { describe, expect, it } from "vitest";

import type { RedirectRuleResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getRedirectRule } from "./get.ts";

describe("getRedirectRule", () => {
  it("should get a redirect rule and format output", async () => {
    const redirect_rule = {
      id: 9,
      from: "/old",
      to: "/new",
      type: "redirect",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ redirect_rule }) as RedirectRuleResponse,
      } as never,
    });

    const result = await getRedirectRule({ server_id: "1", site_id: "2", id: "9" }, ctx);

    expect(result.data.from).toBe("/old");
  });
});
