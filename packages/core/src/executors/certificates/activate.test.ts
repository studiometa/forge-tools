import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { activateCertificate } from "./activate.ts";

describe("activateCertificate", () => {
  it("should activate a certificate for a domain", async () => {
    const postMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({
      client: { post: postMock } as never,
      organizationSlug: "test-org",
    });

    const result = await activateCertificate({ server_id: "1", site_id: "2", domain_id: "5" }, ctx);

    expect(postMock).toHaveBeenCalledWith(
      "/orgs/test-org/servers/1/sites/2/domains/5/certificate/actions",
      { action: "activate" },
    );
    expect(result.data).toBeUndefined();
  });
});
