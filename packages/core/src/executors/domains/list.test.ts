import { describe, expect, it, vi } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listDomains } from "./list.ts";

const domain = (name: string, type: string) => ({
  name,
  type,
  status: "enabled",
  www_redirect_type: "none",
  allow_wildcard_subdomains: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
});

describe("listDomains", () => {
  it("lists the domains of the site", async () => {
    const get = vi.fn(async () =>
      mockListDocument("domainRecords", [
        { id: 1, attributes: domain("www.example.com", "primary") },
        { id: 2, attributes: domain("example.com", "alias") },
      ]),
    );
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "org" });

    const result = await listDomains({ server_id: "123", site_id: "456" }, ctx);

    expect(get.mock.calls[0][0]).toBe("/orgs/org/servers/123/sites/456/domains");
    expect(result.data).toMatchObject([
      { id: 1, name: "www.example.com", type: "primary" },
      { id: 2, name: "example.com", type: "alias" },
    ]);
  });

  it("follows the next pages", async () => {
    const first = mockListDocument("domainRecords", [
      { id: 1, attributes: domain("www.example.com", "primary") },
    ]);
    const get = vi
      .fn()
      .mockResolvedValueOnce({ ...first, meta: { ...first.meta, next_cursor: "c2" } })
      .mockResolvedValueOnce(
        mockListDocument("domainRecords", [{ id: 2, attributes: domain("example.com", "alias") }]),
      );
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "org" });

    const result = await listDomains({ server_id: "123", site_id: "456" }, ctx);

    expect(decodeURIComponent(get.mock.calls[1][0] as string)).toBe(
      "/orgs/org/servers/123/sites/456/domains?page[cursor]=c2",
    );
    expect(result.data.map((item) => item.name)).toEqual(["www.example.com", "example.com"]);
  });
});
