import { describe, expect, it } from "vitest";

import type { RedirectRuleResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createRedirectRule } from "./create.ts";

describe("createRedirectRule", () => {
  it("should create a redirect rule and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            redirect_rule: { id: 9, from: "/old", to: "/new" },
          }) as RedirectRuleResponse,
      } as never,
    });

    const result = await createRedirectRule(
      { server_id: "1", site_id: "2", from: "/old", to: "/new", type: "redirect" },
      ctx,
    );

    expect(result.data.from).toBe("/old");
  });
});
