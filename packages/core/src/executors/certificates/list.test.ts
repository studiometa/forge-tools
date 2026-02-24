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
            {
              id: 2,
              domain: "api.example.com",
              type: "existing",
              active: false,
              status: "installing",
            },
          ],
        }),
      } as never,
    });
    const result = await listCertificates({ server_id: "1", site_id: "2" }, ctx);
    expect(result.data).toHaveLength(2);
    expect(result.text).toContain("example.com");
    expect(result.text).toContain("active");
    expect(result.text).toContain("inactive");
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => ({ certificates: [] }) } as never,
    });
    const result = await listCertificates({ server_id: "1", site_id: "2" }, ctx);
    expect(result.data).toHaveLength(0);
    expect(result.text).toContain("No certificates");
  });
});
