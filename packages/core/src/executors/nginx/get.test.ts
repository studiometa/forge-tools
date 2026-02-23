import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { getNginxConfig } from "./get.ts";

describe("getNginxConfig", () => {
  it("should get nginx configuration", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => "server { listen 80; }",
      } as never,
    });
    const result = await getNginxConfig({ server_id: "1", site_id: "2" }, ctx);
    expect(result.data).toContain("listen 80");
    expect(result.text).toContain("Nginx configuration");
  });
});
