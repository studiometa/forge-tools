import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { SitesCollection, SiteResource, SiteEnvResource, SiteNginxResource } from "./sites.ts";
import { DeploymentsCollection } from "./deployments.ts";
import { CertificatesCollection } from "./certificates.ts";

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
        json: async () => ({
          site: { id: 456 },
          sites: [],
          deployment: {},
          deployments: [],
          certificate: {},
          certificates: [],
        }),
        text: async () => "APP_ENV=production",
      } as Response;
    },
  });

  return { client, calls };
}

describe("SitesCollection", () => {
  it("should list sites", async () => {
    const { client } = createTrackingClient();
    const collection = new SitesCollection(client, 123);

    const result = await collection.list();
    expect(result).toBeDefined();
  });

  it("should get a site", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SitesCollection(client, 123);

    await collection.get(456);
    expect(calls[0]!.url).toContain("/servers/123/sites/456");
  });

  it("should create a site", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SitesCollection(client, 123);

    await collection.create({ domain: "example.com", project_type: "php" });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toEqual({ domain: "example.com", project_type: "php" });
  });

  it("should update a site", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SitesCollection(client, 123);

    await collection.update(456, { directory: "/public" });
    expect(calls[0]!.method).toBe("PUT");
    expect(calls[0]!.url).toContain("/servers/123/sites/456");
  });

  it("should delete a site", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SitesCollection(client, 123);

    await collection.delete(456);
    expect(calls[0]!.method).toBe("DELETE");
  });
});

describe("SiteResource", () => {
  it("should expose nested resources", () => {
    const { client } = createTrackingClient();
    const resource = new SiteResource(client, 123, 456);

    expect(resource.deployments).toBeInstanceOf(DeploymentsCollection);
    expect(resource.certificates).toBeInstanceOf(CertificatesCollection);
    expect(resource.env).toBeInstanceOf(SiteEnvResource);
    expect(resource.nginx).toBeInstanceOf(SiteNginxResource);
  });

  it("should get site details", async () => {
    const { client, calls } = createTrackingClient();
    const resource = new SiteResource(client, 123, 456);

    await resource.get();
    expect(calls[0]!.url).toContain("/servers/123/sites/456");
  });

  it("should deploy site", async () => {
    const { client, calls } = createTrackingClient();
    const resource = new SiteResource(client, 123, 456);

    await resource.deploy();
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.url).toContain("/servers/123/sites/456/deployment/deploy");
  });

  it("should delete site", async () => {
    const { client, calls } = createTrackingClient();
    const resource = new SiteResource(client, 123, 456);

    await resource.delete();
    expect(calls[0]!.method).toBe("DELETE");
  });
});

describe("SiteEnvResource", () => {
  it("should get env content", async () => {
    const { client, calls } = createTrackingClient();
    const env = new SiteEnvResource(client, 123, 456);

    await env.get();
    expect(calls[0]!.url).toContain("/servers/123/sites/456/env");
  });

  it("should update env content", async () => {
    const { client, calls } = createTrackingClient();
    const env = new SiteEnvResource(client, 123, 456);

    await env.update("APP_ENV=production");
    expect(calls[0]!.method).toBe("PUT");
    expect(calls[0]!.body).toEqual({ content: "APP_ENV=production" });
  });
});

describe("SiteNginxResource", () => {
  it("should get nginx config", async () => {
    const { client, calls } = createTrackingClient();
    const nginx = new SiteNginxResource(client, 123, 456);

    await nginx.get();
    expect(calls[0]!.url).toContain("/servers/123/sites/456/nginx");
  });

  it("should update nginx config", async () => {
    const { client, calls } = createTrackingClient();
    const nginx = new SiteNginxResource(client, 123, 456);

    await nginx.update("server { }");
    expect(calls[0]!.method).toBe("PUT");
    expect(calls[0]!.body).toEqual({ content: "server { }" });
  });
});
