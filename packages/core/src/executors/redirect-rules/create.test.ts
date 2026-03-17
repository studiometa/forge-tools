import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createRedirectRule } from "./create.ts";

describe("createRedirectRule", () => {
  it("should create a redirect rule and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(9, "redirect-rules", {
            from: "/old",
            to: "/new",
            type: "redirect",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createRedirectRule(
      { server_id: "1", site_id: "2", from: "/old", to: "/new", type: "redirect" },
      ctx,
    );

    expect(result.data.from).toBe("/old");
  });
});
