import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getCertificate } from "./get.ts";

describe("getCertificate", () => {
  it("should get a certificate for a domain", async () => {
    const getMock = async () =>
      mockDocument(10, "certificates", {
        domain: "example.com",
        type: "letsencrypt",
        request_status: "success",
        status: "installed",
        existing: false,
        active: true,
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getCertificate({ server_id: "1", site_id: "2", domain_id: "5" }, ctx);

    expect(result.data.domain).toBe("example.com");
  });
});
