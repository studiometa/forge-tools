import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getRedirectRule } from "./get.ts";

describe("getRedirectRule", () => {
  it("should get a redirect rule and format output", async () => {
    const getMock = async () =>
      mockDocument(9, "redirect-rules", {
        from: "/old",
        to: "/new",
        type: "redirect",
        status: "active",
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getRedirectRule({ server_id: "1", site_id: "2", id: "9" }, ctx);

    expect(result.data.from).toBe("/old");
  });
});
