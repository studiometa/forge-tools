import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createCertificate } from "./create.ts";

describe("createCertificate", () => {
  it("should create a certificate for a domain", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(10, "certificates", {
            domain: "example.com",
            type: "letsencrypt",
            request_status: "pending",
            status: "installing",
            existing: false,
            active: false,
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createCertificate(
      { server_id: "1", site_id: "2", domain_id: "5", type: "letsencrypt" },
      ctx,
    );

    expect(result.data.domain).toBe("example.com");
  });
});
