import { describe, expect, it, vi } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listCertificates } from "./list.ts";

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

describe("listCertificates", () => {
  it("should list the certificates of a domain", async () => {
    const getMock = vi.fn(async () =>
      mockListDocument("certificates", [{ id: 9, attributes: certificate }]),
    );
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listCertificates({ server_id: "1", site_id: "2", domain_id: "5" }, ctx);

    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/2/domains/5/certificates");
    expect(result.data).toEqual([{ id: 9, ...certificate }]);
  });

  it("should list the certificates of every domain of a site without a domain", async () => {
    const getMock = vi.fn(async () => mockListDocument("certificates", []));
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listCertificates({ server_id: "1", site_id: "2" }, ctx);

    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/2/certificates");
    expect(result.data).toEqual([]);
  });
});
