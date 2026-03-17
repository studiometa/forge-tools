import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { ServersCollection, ServerResource, type ResolveResult } from "./servers.ts";
import { SitesCollection, SiteResource } from "./sites.ts";
import { DatabasesCollection } from "./databases.ts";
import { DatabaseUsersCollection } from "./database-users.ts";
import { DaemonsCollection } from "./daemons.ts";
import { BackupsCollection } from "./backups.ts";
import { ScheduledJobsCollection } from "./scheduled-jobs.ts";
import { MonitorsCollection } from "./monitors.ts";
import { FirewallRulesCollection } from "./firewall-rules.ts";
import { SshKeysCollection } from "./ssh-keys.ts";
import { NginxTemplatesCollection } from "./nginx-templates.ts";

const ORG = "test-org";

function mockDocument<T>(id: string | number, attributes: T) {
  return {
    data: { id: String(id), type: "resource", attributes },
  };
}

function mockListDocument<T>(items: Array<{ id: string | number; attributes: T }>) {
  return {
    data: items.map(({ id, attributes }) => ({ id: String(id), type: "resource", attributes })),
    links: {},
    meta: { per_page: 200, next_cursor: null },
  };
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
        json: async () => mockListDocument([{ id: "1", attributes: { name: "web-1" } }]),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("ServersCollection", () => {
  it("should list servers", async () => {
    const servers = mockListDocument([
      { id: "1", attributes: { name: "web-1" } },
      { id: "2", attributes: { name: "web-2" } },
    ]);
    const client = createClient(servers);
    const collection = new ServersCollection(client, ORG);

    const result = await collection.list();
    expect(result).toHaveLength(2);
    expect(result[0]!.name).toBe("web-1");
    expect(result[0]!.id).toBe(1);
  });

  it("should list servers with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ServersCollection(client, ORG);

    await collection.list({ cursor: "abc123" });
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers?page[cursor]=abc123`);
  });

  it("should get a server", async () => {
    const client = createClient(mockDocument("1", { name: "web-1" }));
    const collection = new ServersCollection(client, ORG);

    const server = await collection.get(1);
    expect(server.name).toBe("web-1");
    expect(server.id).toBe(1);
  });

  it("should create a server", async () => {
    const client = createClient(mockDocument("3", { name: "web-3" }));
    const collection = new ServersCollection(client, ORG);

    const server = await collection.create({
      provider: "ocean2",
      credential_id: 1,
      name: "web-3",
      type: "app",
      size: "01",
      region: "ams3",
    });
    expect(server.name).toBe("web-3");
    expect(server.id).toBe(3);
  });

  it("should update a server", async () => {
    const client = createClient(mockDocument("1", { name: "renamed" }));
    const collection = new ServersCollection(client, ORG);

    const server = await collection.update(1, { name: "renamed" });
    expect(server.name).toBe("renamed");
  });

  it("should delete a server", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ServersCollection(client, ORG);

    await collection.delete(1);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/1`);
  });

  it("should reboot a server", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ServersCollection(client, ORG);

    await collection.reboot(1);
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/1/reboot`);
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new ServersCollection(client, ORG);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should iterate all servers across pages via all()", async () => {
    let callCount = 0;
    const client = new HttpClient({
      token: "test",
      fetch: async () => {
        const items =
          callCount === 0
            ? Array.from({ length: 200 }, (_, i) => ({
                id: String(i + 1),
                type: "resource",
                attributes: { name: `web-${i + 1}` },
              }))
            : [{ id: "201", type: "resource", attributes: { name: "web-201" } }];
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
    const collection = new ServersCollection(client, ORG);

    const results = await collection.all().toArray();
    expect(results).toHaveLength(201);
  });

  describe("URL prefix", () => {
    it("should use /orgs/{slug}/servers prefix", async () => {
      const { client, calls } = createTrackingClient();
      const collection = new ServersCollection(client, ORG);
      await collection.list();
      expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers`);
    });
  });

  describe("resolve", () => {
    it("should resolve servers by partial name", async () => {
      const client = createClient(
        mockListDocument([
          { id: "1", attributes: { name: "prod-web-1" } },
          { id: "2", attributes: { name: "prod-web-2" } },
          { id: "3", attributes: { name: "staging-web-1" } },
        ]),
      );
      const collection = new ServersCollection(client, ORG);
      const result: ResolveResult = await collection.resolve("prod");

      expect(result.query).toBe("prod");
      expect(result.total).toBe(2);
      expect(result.matches).toEqual([
        { id: 1, name: "prod-web-1" },
        { id: 2, name: "prod-web-2" },
      ]);
    });

    it("should return exact match as single result", async () => {
      const client = createClient(
        mockListDocument([
          { id: "1", attributes: { name: "prod" } },
          { id: "2", attributes: { name: "prod-extra" } },
        ]),
      );
      const collection = new ServersCollection(client, ORG);
      const result = await collection.resolve("prod");

      expect(result.total).toBe(1);
      expect(result.matches[0]!.id).toBe(1);
    });

    it("should return empty for no matches", async () => {
      const client = createClient(
        mockListDocument([{ id: "1", attributes: { name: "prod-web-1" } }]),
      );
      const collection = new ServersCollection(client, ORG);
      const result = await collection.resolve("unknown");

      expect(result.total).toBe(0);
      expect(result.matches).toEqual([]);
    });

    it("should be case insensitive", async () => {
      const client = createClient(
        mockListDocument([{ id: "1", attributes: { name: "Prod-Web-1" } }]),
      );
      const collection = new ServersCollection(client, ORG);
      const result = await collection.resolve("prod");

      expect(result.total).toBe(1);
    });
  });
});

describe("ServerResource", () => {
  it("should expose nested collections", () => {
    const client = createClient();
    const resource = new ServerResource(client, ORG, 123);

    expect(resource.sites).toBeInstanceOf(SitesCollection);
    expect(resource.databases).toBeInstanceOf(DatabasesCollection);
    expect(resource.databaseUsers).toBeInstanceOf(DatabaseUsersCollection);
    expect(resource.daemons).toBeInstanceOf(DaemonsCollection);
    expect(resource.backups).toBeInstanceOf(BackupsCollection);
    expect(resource.scheduledJobs).toBeInstanceOf(ScheduledJobsCollection);
    expect(resource.monitors).toBeInstanceOf(MonitorsCollection);
    expect(resource.firewallRules).toBeInstanceOf(FirewallRulesCollection);
    expect(resource.sshKeys).toBeInstanceOf(SshKeysCollection);
    expect(resource.nginxTemplates).toBeInstanceOf(NginxTemplatesCollection);
  });

  it("should return a SiteResource", () => {
    const client = createClient();
    const resource = new ServerResource(client, ORG, 123);

    expect(resource.site(456)).toBeInstanceOf(SiteResource);
  });

  it("should get server details", async () => {
    const client = createClient(mockDocument("123", { name: "web-1" }));
    const resource = new ServerResource(client, ORG, 123);

    const server = await resource.get();
    expect(server.name).toBe("web-1");
    expect(server.id).toBe(123);
  });

  it("should reboot server", async () => {
    const { client, calls } = createTrackingClient();
    const resource = new ServerResource(client, ORG, 123);

    await resource.reboot();
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/reboot`);
  });

  it("should delete server", async () => {
    const { client, calls } = createTrackingClient();
    const resource = new ServerResource(client, ORG, 123);

    await resource.delete();
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123`);
  });
});
