import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { updateSecurityRule } from "./update.ts";

describe("updateSecurityRule", () => {
  it("should update a security rule and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        put: async () =>
          mockDocument(11, "security-rules", {
            name: "Updated Rule",
            path: "/secret",
            status: null,
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-02T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await updateSecurityRule(
      {
        server_id: "1",
        site_id: "2",
        id: "11",
        name: "Updated Rule",
        path: "/secret",
        credentials: [{ username: "admin", password: "pass123" }],
      },
      ctx,
    );

    expect(result.data.name).toBe("Updated Rule");
    expect(result.data.path).toBe("/secret");
    expect(result.data.id).toBe(11);
  });
});
