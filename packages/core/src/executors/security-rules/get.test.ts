import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getSecurityRule } from "./get.ts";

describe("getSecurityRule", () => {
  it("should get a security rule and format output", async () => {
    const getMock = async () =>
      mockDocument(11, "security-rules", {
        name: "Restrict Admin",
        path: "/admin",
        status: null,
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getSecurityRule({ server_id: "1", site_id: "2", id: "11" }, ctx);

    expect(result.data.name).toBe("Restrict Admin");
  });
});
