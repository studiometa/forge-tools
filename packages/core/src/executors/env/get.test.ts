import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { getEnv } from "./get.ts";

describe("getEnv", () => {
  it("should get environment variables", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => "APP_ENV=production\nAPP_DEBUG=false",
      } as never,
    });
    const result = await getEnv({ server_id: "1", site_id: "2" }, ctx);
    expect(result.data).toContain("APP_ENV=production");
    expect(result.text).toContain("Environment variables");
  });
});
