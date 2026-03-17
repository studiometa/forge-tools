import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listCertificates } from "./list.ts";

describe("listCertificates", () => {
  it("should list certificates for a site", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () =>
          mockListDocument("certificates", [
            {
              id: 1,
              attributes: {
                domain: "example.com",
                type: "letsencrypt",
                request_status: "success",
                status: "installed",
                existing: false,
                active: true,
                created_at: "2024-01-01T00:00:00.000000Z",
                updated_at: "2024-01-01T00:00:00.000000Z",
              },
            },
            {
              id: 2,
              attributes: {
                domain: "api.example.com",
                type: "existing",
                request_status: "pending",
                status: "installing",
                existing: true,
                active: false,
                created_at: "2024-01-01T00:00:00.000000Z",
                updated_at: "2024-01-01T00:00:00.000000Z",
              },
            },
          ]),
      } as never,
      organizationSlug: "test-org",
    });
    const result = await listCertificates({ server_id: "1", site_id: "2" }, ctx);
    expect(result.data).toHaveLength(2);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("certificates", []) } as never,
      organizationSlug: "test-org",
    });
    const result = await listCertificates({ server_id: "1", site_id: "2" }, ctx);
    expect(result.data).toHaveLength(0);
  });
});
