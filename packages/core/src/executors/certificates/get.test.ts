import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getCertificate } from "./get.ts";

const certificate = {
  type: "letsencrypt",
  verification_method: "http-01",
  key_type: "ecdsa",
  preferred_chain: null,
  request_status: "created",
  status: "installed",
  active: true,
  created_at: "2024-01-01T00:00:00.000000Z",
  updated_at: "2024-01-01T00:00:00.000000Z",
};

describe("getCertificate", () => {
  it("should get the active certificate of a domain without an id", async () => {
    const getMock = vi.fn(async () => mockDocument(10, "certificates", certificate));
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getCertificate({ server_id: "1", site_id: "2", domain_id: "5" }, ctx);

    expect(getMock).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/sites/2/domains/5/certificates/active",
    );
    expect(result.data).toMatchObject({ id: 10, type: "letsencrypt", active: true });
  });

  it("should get a certificate of a domain by id", async () => {
    const getMock = vi.fn(async () =>
      mockDocument(9, "certificates", { ...certificate, active: false }),
    );
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getCertificate(
      { server_id: "1", site_id: "2", domain_id: "5", id: "9" },
      ctx,
    );

    expect(getMock).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/sites/2/domains/5/certificates/9",
    );
    expect(result.data).toMatchObject({ id: 9, active: false });
  });
});
