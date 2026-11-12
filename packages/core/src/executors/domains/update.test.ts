import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { updateDomain } from "./update.ts";

describe("updateDomain", () => {
  it("updates the www redirect of a domain", async () => {
    const patch = vi.fn(async () =>
      mockDocument(7, "domainRecords", {
        name: "example.com",
        type: "primary",
        status: "enabled",
        www_redirect_type: "to-www",
        allow_wildcard_subdomains: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }),
    );
    const ctx = createTestExecutorContext({ client: { patch } as never, organizationSlug: "org" });

    const result = await updateDomain(
      { server_id: "123", site_id: "456", domain_id: "7", www_redirect_type: "to-www" },
      ctx,
    );

    expect(patch).toHaveBeenCalledWith("/orgs/org/servers/123/sites/456/domains/7", {
      www_redirect_type: "to-www",
    });
    expect(result.data).toMatchObject({ id: 7, name: "example.com", www_redirect_type: "to-www" });
  });
});
