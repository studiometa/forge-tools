import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deactivateCertificate } from "./deactivate.ts";

describe("deactivateCertificate", () => {
  it("should disable a certificate of a domain", async () => {
    const postMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { post: postMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deactivateCertificate(
      { server_id: "1", site_id: "2", domain_id: "5", id: "9" },
      ctx,
    );

    expect(postMock).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/sites/2/domains/5/certificates/9/actions",
      { action: "disable" },
    );
    expect(result.data).toBeUndefined();
  });
});
