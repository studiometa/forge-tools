import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { createRedirectRule } from "./create.ts";

describe("createRedirectRule", () => {
  it("should create a redirect rule and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () => undefined,
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createRedirectRule(
      { server_id: "1", site_id: "2", from: "/old", to: "/new", type: "redirect" },
      ctx,
    );

    expect(result.data).toBeUndefined();
  });
});
