import { ForgeApiError } from "@studiometa/forge-api";
import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { mockListDocument } from "../../test-helpers.ts";
import { listDomains, resolveDomainId } from "./list.ts";

function domain(name: string, type = "alias") {
  return {
    name,
    type,
    status: "enabled",
    www_redirect_type: "none",
    allow_wildcard_subdomains: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };
}

function domainsList() {
  return mockListDocument("domainRecords", [
    { id: 5, attributes: domain("example.com", "primary") },
    { id: 6, attributes: domain("www.example.com") },
    { id: 7, attributes: domain("shop.example.com") },
  ]);
}

describe("listDomains", () => {
  it("should list the domains of a site", async () => {
    const getMock = vi.fn(async () => domainsList());
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listDomains({ server_id: "1", site_id: "2" }, ctx);

    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/sites/2/domains");
    expect(result.data).toHaveLength(3);
    expect(result.data[1]).toMatchObject({ id: 6, name: "www.example.com", type: "alias" });
  });
});

describe("resolveDomainId", () => {
  it("should return a numeric domain as an ID without an API call", async () => {
    const getMock = vi.fn();
    const ctx = createTestExecutorContext({ client: { get: getMock } as never });

    expect(await resolveDomainId("1", "2", "6", ctx)).toBe("6");
    expect(getMock).not.toHaveBeenCalled();
  });

  it.each([
    ["example.com", "5"],
    ["WWW.Example.com", "6"],
    [" shop.example.com ", "7"],
    ["shop", "7"],
  ])("should resolve %j to domain ID %s", async (name, id) => {
    const ctx = createTestExecutorContext({
      client: { get: async () => domainsList() } as never,
      organizationSlug: "test-org",
    });

    expect(await resolveDomainId("1", "2", name, ctx)).toBe(id);
  });

  it("should throw with the site domains when there is no match", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => domainsList() } as never,
      organizationSlug: "test-org",
    });

    await expect(resolveDomainId("1", "2", "other.org", ctx)).rejects.toThrow(
      'No domain matching "other.org" on site 2. Domains: example.com (5), www.example.com (6), shop.example.com (7).',
    );
  });

  it("should say none when the site has no domain", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("domainRecords", []) } as never,
      organizationSlug: "test-org",
    });

    await expect(resolveDomainId("1", "2", "example.com", ctx)).rejects.toThrow("Domains: none.");
  });

  it("should throw with the matches when the name is ambiguous", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => domainsList() } as never,
      organizationSlug: "test-org",
    });

    await expect(resolveDomainId("1", "2", "example", ctx)).rejects.toThrow(
      'Ambiguous domain "example" on site 2: example.com (5), www.example.com (6), shop.example.com (7). Use the full name or the domain ID.',
    );
  });

  it("should tell to use the domain ID when the token cannot list domains", async () => {
    const forbidden = new ForgeApiError({ status: 403, message: "Forbidden", url: "/domains" });
    const ctx = createTestExecutorContext({
      client: {
        get: async () => {
          throw forbidden;
        },
      } as never,
      organizationSlug: "test-org",
    });

    const error = await resolveDomainId("1", "2", "www.example.com", ctx).catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(
      'Cannot list the domains of site 2 to resolve "www.example.com": the API token needs the site:meta scope. Use the domain record ID instead.',
    );
    expect(error.cause).toBe(forbidden);
  });

  it("should rethrow other errors when listing domains fails", async () => {
    const notFound = new ForgeApiError({ status: 404, message: "Not found", url: "/domains" });
    const ctx = createTestExecutorContext({
      client: {
        get: async () => {
          throw notFound;
        },
      } as never,
      organizationSlug: "test-org",
    });

    await expect(resolveDomainId("1", "2", "www.example.com", ctx)).rejects.toBe(notFound);
  });
});
