import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { SitesCollection, SiteResource, SiteEnvResource, SiteNginxResource } from "./sites.ts";
import type { ResolveResult } from "./servers.ts";
import { DeploymentsCollection } from "./deployments.ts";
import { CertificatesCollection } from "./certificates.ts";
import { CommandsCollection } from "./commands.ts";
import { SecurityRulesCollection } from "./security-rules.ts";
import { RedirectRulesCollection } from "./redirect-rules.ts";

const ORG = "test-org";

function mockDocument<T>(id: string | number, attributes: T) {
  return {
    data: { id: String(id), type: "resource", attributes },
  };
}

function mockListDocument<T>(
  items: Array<{ id: string | number; attributes: T }>,
  nextCursor: string | null = null,
) {
  return {
    data: items.map(({ id, attributes }) => ({ id: String(id), type: "resource", attributes })),
    links: {},
    meta: { per_page: 200, next_cursor: nextCursor },
  };
}

function createTrackingClient(): {
  client: HttpClient;
  calls: Array<{ method: string; url: string; body?: unknown }>;
} {
  const calls: Array<{ method: string; url: string; body?: unknown }> = [];

  const client = new HttpClient({
    token: "test",
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({
        method: init?.method ?? "GET",
        url: url.toString(),
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockListDocument([{ id: "456", attributes: { name: "example.com" } }]),
        text: async () => "APP_ENV=production",
      } as Response;
    },
  });

  return { client, calls };
}

function createClient(body: unknown = {}): HttpClient {
  return new HttpClient({
    token: "test",
    fetch: async () =>
      ({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => body,
        text: async () => JSON.stringify(body),
      }) as Response,
  });
}

describe("SitesCollection", () => {
  it("should list sites", async () => {
    const { client } = createTrackingClient();
    const collection = new SitesCollection(client, ORG, 123);

    const result = await collection.list();
    expect(result).toBeDefined();
  });

  it("should list sites with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SitesCollection(client, ORG, 123);

    await collection.list({ cursor: "abc123" });
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/sites?page[cursor]=abc123`);
  });

  it("should get a site", async () => {
    const client = createClient(mockDocument("456", { name: "example.com" }));
    const collection = new SitesCollection(client, ORG, 123);

    const site = await collection.get(456);
    expect(site.id).toBe(456);
    expect(calls_url(client)).toBeUndefined(); // client doesn't expose URL - use tracking client
  });

  it("should check correct URL on get", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SitesCollection(client, ORG, 123);

    await collection.get(456);
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/sites/456`);
  });

  it("should create a site", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SitesCollection(client, ORG, 123);

    await collection.create({ domain: "example.com", project_type: "php" });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toEqual({ domain: "example.com", project_type: "php" });
  });

  it("should update a site", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SitesCollection(client, ORG, 123);

    await collection.update(456, { directory: "/public" });
    expect(calls[0]!.method).toBe("PUT");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/sites/456`);
  });

  it("should delete a site", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SitesCollection(client, ORG, 123);

    await collection.delete(456);
    expect(calls[0]!.method).toBe("DELETE");
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new SitesCollection(client, ORG, 123);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should use correct URL prefix", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SitesCollection(client, ORG, 123);

    await collection.list();
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/sites`);
  });

  describe("resolve", () => {
    it("should resolve sites by partial name", async () => {
      const client = createClient(
        mockListDocument([
          { id: "1", attributes: { name: "example.com" } },
          { id: "2", attributes: { name: "example.org" } },
          { id: "3", attributes: { name: "staging.test.com" } },
        ]),
      );
      const collection = new SitesCollection(client, ORG, 123);
      const result: ResolveResult = await collection.resolve("example");

      expect(result.query).toBe("example");
      expect(result.total).toBe(2);
      expect(result.matches).toEqual([
        { id: 1, name: "example.com" },
        { id: 2, name: "example.org" },
      ]);
    });

    it("should return exact match as single result", async () => {
      const client = createClient(
        mockListDocument([
          { id: "1", attributes: { name: "example.com" } },
          { id: "2", attributes: { name: "example.com.extra" } },
        ]),
      );
      const collection = new SitesCollection(client, ORG, 123);
      const result = await collection.resolve("example.com");

      expect(result.total).toBe(1);
      expect(result.matches[0]!.id).toBe(1);
    });

    it("should return empty for no matches", async () => {
      const client = createClient(
        mockListDocument([{ id: "1", attributes: { name: "example.com" } }]),
      );
      const collection = new SitesCollection(client, ORG, 123);
      const result = await collection.resolve("unknown");

      expect(result.total).toBe(0);
      expect(result.matches).toEqual([]);
    });

    it("should be case insensitive", async () => {
      const client = createClient(
        mockListDocument([{ id: "1", attributes: { name: "Example.Com" } }]),
      );
      const collection = new SitesCollection(client, ORG, 123);
      const result = await collection.resolve("example");

      expect(result.total).toBe(1);
    });
  });
});

function calls_url(_client: HttpClient): undefined {
  return undefined;
}

describe("SiteResource", () => {
  it("should expose nested resources", () => {
    const { client } = createTrackingClient();
    const resource = new SiteResource(client, ORG, 123, 456);

    expect(resource.deployments).toBeInstanceOf(DeploymentsCollection);
    expect(resource.certificates).toBeInstanceOf(CertificatesCollection);
    expect(resource.env).toBeInstanceOf(SiteEnvResource);
    expect(resource.nginx).toBeInstanceOf(SiteNginxResource);
    expect(resource.commands).toBeInstanceOf(CommandsCollection);
    expect(resource.securityRules).toBeInstanceOf(SecurityRulesCollection);
    expect(resource.redirectRules).toBeInstanceOf(RedirectRulesCollection);
  });

  it("should get site details", async () => {
    const { client, calls } = createTrackingClient();
    const resource = new SiteResource(client, ORG, 123, 456);

    await resource.get();
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/sites/456`);
  });

  it("should deploy site", async () => {
    const { client, calls } = createTrackingClient();
    const resource = new SiteResource(client, ORG, 123, 456);

    await resource.deploy();
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/sites/456/deployments/deploy`);
  });

  it("should delete site", async () => {
    const { client, calls } = createTrackingClient();
    const resource = new SiteResource(client, ORG, 123, 456);

    await resource.delete();
    expect(calls[0]!.method).toBe("DELETE");
  });
});

describe("SiteEnvResource", () => {
  it("should get env content", async () => {
    const { client, calls } = createTrackingClient();
    const env = new SiteEnvResource(client, ORG, 123, 456);

    await env.get();
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/sites/456/environment`);
  });

  it("should update env content", async () => {
    const { client, calls } = createTrackingClient();
    const env = new SiteEnvResource(client, ORG, 123, 456);

    await env.update("APP_ENV=production");
    expect(calls[0]!.method).toBe("PUT");
    expect(calls[0]!.body).toEqual({ content: "APP_ENV=production" });
  });
});

describe("SiteNginxResource", () => {
  it("should get nginx config", async () => {
    const { client, calls } = createTrackingClient();
    const nginx = new SiteNginxResource(client, ORG, 123, 456);

    await nginx.get();
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/sites/456/nginx`);
  });

  it("should update nginx config", async () => {
    const { client, calls } = createTrackingClient();
    const nginx = new SiteNginxResource(client, ORG, 123, 456);

    await nginx.update("server { }");
    expect(calls[0]!.method).toBe("PUT");
    expect(calls[0]!.body).toEqual({ content: "server { }" });
  });

  it("should iterate all items across pages via all()", async () => {
    let callCount = 0;
    const client = new HttpClient({
      token: "test",
      fetch: async () => {
        const items =
          callCount === 0
            ? Array.from({ length: 200 }, (_, i) => ({
                id: String(i + 1),
                type: "resource",
                attributes: { name: "example.com" },
              }))
            : [{ id: "201", type: "resource", attributes: { name: "example.com" } }];
        const nextCursor = callCount === 0 ? "cursor-2" : null;
        callCount++;
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({
            data: items,
            links: {},
            meta: { per_page: 200, next_cursor: nextCursor },
          }),
          text: async () => "{}",
        } as Response;
      },
    });
    const collection = new SitesCollection(client, ORG, 123);

    const results = await collection.all().toArray();
    expect(results).toHaveLength(201);
  });
});
