import { describe, expect, it, vi } from "vitest";

import { Forge } from "../forge.ts";
import { createMockFetch } from "../test-utils.ts";
import { DomainNginxResource, DomainResource, DomainsCollection } from "./domains.ts";

const ORG = "test-org";
const BASE = `https://forge.laravel.com/api/orgs/${ORG}/servers/123/sites/456/domains`;

function domain(id: number, name: string) {
  return {
    id: String(id),
    type: "domainRecords",
    attributes: {
      name,
      type: "alias",
      status: "enabled",
      www_redirect_type: "none",
      allow_wildcard_subdomains: false,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  };
}

function listPage(items: unknown[], next_cursor: string | null = null) {
  return {
    data: items,
    links: { next: null, prev: null },
    meta: { per_page: 30, next_cursor, prev_cursor: null },
  };
}

function setup(handler: (url: string) => unknown = () => ({})) {
  const fetch = createMockFetch((url) => handler(url));
  const site = new Forge("token", ORG, { fetch }).server(123).site(456);
  const call = (index = 0) => {
    const [url, init] = vi.mocked(fetch).mock.calls[index] as [string, RequestInit | undefined];
    return {
      url,
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(init.body as string) : undefined,
    };
  };
  return { site, call, fetchMock: vi.mocked(fetch) };
}

describe("DomainsCollection", () => {
  it("should be exposed on a site", () => {
    const { site } = setup();
    expect(site.domains).toBeInstanceOf(DomainsCollection);
  });

  it("should list domains", async () => {
    const { site, call } = setup(() => listPage([domain(789, "www.example.com")]));

    const domains = await site.domains.list();

    expect(call().url).toBe(BASE);
    expect(domains).toEqual([expect.objectContaining({ id: 789, name: "www.example.com" })]);
  });

  it("should pass the cursor when listing domains", async () => {
    const { site, call } = setup(() => listPage([]));

    await site.domains.list({ cursor: "abc" });

    expect(call().url).toBe(`${BASE}?page[cursor]=abc`);
  });

  it("should iterate all domains across pages", async () => {
    const { site, call } = setup((url) =>
      url.includes("cursor")
        ? listPage([domain(2, "www.example.com")])
        : listPage([domain(1, "example.com")], "next"),
    );

    const domains = await site.domains.all().toArray();

    expect(domains.map((d) => d.id)).toEqual([1, 2]);
    expect(call(1).url).toBe(`${BASE}?page[cursor]=next`);
  });

  it("should resolve an exact domain name before partial matches", async () => {
    const { site } = setup(() =>
      listPage([domain(1, "example.com"), domain(2, "www.example.com")]),
    );

    const result = await site.domains.resolve("example.com");

    expect(result).toEqual({
      query: "example.com",
      matches: [{ id: 1, name: "example.com" }],
      total: 1,
    });
  });

  it("should return all partial matches", async () => {
    const { site } = setup(() =>
      listPage([domain(1, "example.com"), domain(2, "www.example.com")]),
    );

    const result = await site.domains.resolve("example");

    expect(result.total).toBe(2);
  });
});

describe("DomainResource", () => {
  it("should expose the domain nginx configuration", () => {
    const { site } = setup();
    const resource = site.domain(789);

    expect(resource).toBeInstanceOf(DomainResource);
    expect(resource.nginx).toBeInstanceOf(DomainNginxResource);
  });
});

describe("DomainNginxResource", () => {
  it("should get the nginx configuration of a domain", async () => {
    const { site, call } = setup(() => ({
      data: {
        id: "1",
        type: "nginxConfigs",
        attributes: { content: "server { listen 80; }" },
      },
    }));

    const config = await site.domain(789).nginx.get();

    expect(call().url).toBe(`${BASE}/789/nginx`);
    expect(config).toBe("server { listen 80; }");
  });

  it("should send the content as config when updating", async () => {
    const { site, call } = setup();

    await site.domain(789).nginx.update("server { }");

    expect(call().url).toBe(`${BASE}/789/nginx`);
    expect(call().method).toBe("PUT");
    expect(call().body).toEqual({ config: "server { }" });
  });
});
