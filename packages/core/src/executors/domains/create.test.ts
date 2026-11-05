import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createDomain } from "./create.ts";

describe("createDomain", () => {
  it("adds a domain to the site", async () => {
    const post = vi.fn(async () =>
      mockDocument(7, "domainRecords", {
        name: "example.com",
        type: "alias",
        status: "pending",
        www_redirect_type: "none",
        allow_wildcard_subdomains: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }),
    );
    const ctx = createTestExecutorContext({ client: { post } as never, organizationSlug: "org" });

    const result = await createDomain(
      {
        server_id: "123",
        site_id: "456",
        name: "example.com",
        allow_wildcard_subdomains: false,
        www_redirect_type: "none",
      },
      ctx,
    );

    expect(post).toHaveBeenCalledWith("/orgs/org/servers/123/sites/456/domains", {
      name: "example.com",
      allow_wildcard_subdomains: false,
      www_redirect_type: "none",
    });
    expect(result.data).toMatchObject({ id: 7, name: "example.com", type: "alias" });
  });
});
