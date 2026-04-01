import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteCertificate } from "./delete.ts";

describe("deleteCertificate", () => {
  it("should delete a certificate for a domain", async () => {
    const deleteMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteCertificate({ server_id: "1", site_id: "2", domain_id: "5" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/sites/2/domains/5/certificate",
    );
    expect(result.data).toBeUndefined();
  });
});
