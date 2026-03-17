import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createSecurityRule } from "./create.ts";

describe("createSecurityRule", () => {
  it("should create a security rule and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(11, "security-rules", {
            name: "Restrict Admin",
            path: "/admin",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createSecurityRule(
      { server_id: "1", site_id: "2", name: "Restrict Admin", path: "/admin", credentials: [] },
      ctx,
    );

    expect(result.data.name).toBe("Restrict Admin");
  });
});
