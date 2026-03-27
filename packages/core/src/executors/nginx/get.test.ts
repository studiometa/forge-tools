import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { mockDocument } from "../../test-helpers.ts";
import { getNginxConfig } from "./get.ts";

describe("getNginxConfig", () => {
  it("should get nginx configuration", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => mockDocument(1, "nginx-configs", { content: "server { listen 80; }" }),
      } as never,
      organizationSlug: "test-org",
    });
    const result = await getNginxConfig({ server_id: "1", site_id: "2" }, ctx);
    expect(result.data).toContain("listen 80");
  });
});
