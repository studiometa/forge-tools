import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getEnv } from "./get.ts";

describe("getEnv", () => {
  it("should get environment variables", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () =>
          mockDocument(1, "environments", {
            content: "APP_ENV=production\nAPP_DEBUG=false",
          }),
      } as never,
      organizationSlug: "test-org",
    });
    const result = await getEnv({ server_id: "1", site_id: "2" }, ctx);
    expect(result.data).toContain("APP_ENV=production");
  });
});
