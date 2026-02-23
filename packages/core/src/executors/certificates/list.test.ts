import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { listCertificates } from "./list.ts";

describe("listCertificates", () => {
  it("should list certificates for a site", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({
          certificates: [
            {
              id: 1,
              domain: "example.com",
              type: "letsencrypt",
              active: true,
              status: "installed",
            },
          ],
        }),
      } as never,
    });
    const result = await listCertificates({ server_id: "1", site_id: "2" }, ctx);
    expect(result.data).toHaveLength(1);
    expect(result.text).toContain("example.com");
  });
});
