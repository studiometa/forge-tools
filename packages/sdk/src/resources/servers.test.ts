import { describe, expect, it, vi } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { ServersCollection, ServerResource } from "./servers.ts";
import { SitesCollection, SiteResource } from "./sites.ts";
import { DatabasesCollection } from "./databases.ts";
import { DatabaseUsersCollection } from "./database-users.ts";
import { DaemonsCollection } from "./daemons.ts";

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
        json: async () => ({ server: {}, servers: [], site: {}, sites: [] }),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("ServersCollection", () => {
  it("should list servers", async () => {
    const servers = [
      { id: 1, name: "web-1" },
      { id: 2, name: "web-2" },
    ];
    const client = createClient({ servers });
    const collection = new ServersCollection(client);

    const result = await collection.list();
    expect(result).toHaveLength(2);
    expect(result[0]!.name).toBe("web-1");
  });

  it("should list servers with page option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ServersCollection(client);

    await collection.list({ page: 2 });
    expect(calls[0]!.url).toContain("/servers?page=2");
  });

  it("should get a server", async () => {
    const client = createClient({ server: { id: 1, name: "web-1" } });
    const collection = new ServersCollection(client);

    const server = await collection.get(1);
    expect(server.name).toBe("web-1");
  });

  it("should create a server", async () => {
    const client = createClient({ server: { id: 3, name: "web-3" } });
    const collection = new ServersCollection(client);

    const server = await collection.create({
      provider: "ocean2",
      credential_id: 1,
      name: "web-3",
      type: "app",
      size: "01",
      region: "ams3",
    });
    expect(server.name).toBe("web-3");
  });

  it("should update a server", async () => {
    const client = createClient({ server: { id: 1, name: "renamed" } });
    const collection = new ServersCollection(client);

    const server = await collection.update(1, { name: "renamed" });
    expect(server.name).toBe("renamed");
  });

  it("should delete a server", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ServersCollection(client);

    await collection.delete(1);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain("/servers/1");
  });

  it("should reboot a server", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ServersCollection(client);

    await collection.reboot(1);
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.url).toContain("/servers/1/reboot");
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new ServersCollection(client);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should iterate all servers across pages via all()", async () => {
    const page1 = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }) as never);
    const page2 = [{ id: 201 } as never];
    const { client } = createTrackingClient();
    const collection = new ServersCollection(client);

    const listSpy = vi
      .spyOn(collection, "list")
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const results = await collection.all().toArray();

    expect(results).toHaveLength(201);
    expect(listSpy).toHaveBeenCalledWith({ page: 1 });
    expect(listSpy).toHaveBeenCalledWith({ page: 2 });
  });
});

describe("ServerResource", () => {
  it("should expose nested collections", () => {
    const client = createClient();
    const resource = new ServerResource(client, 123);

    expect(resource.sites).toBeInstanceOf(SitesCollection);
    expect(resource.databases).toBeInstanceOf(DatabasesCollection);
    expect(resource.databaseUsers).toBeInstanceOf(DatabaseUsersCollection);
    expect(resource.daemons).toBeInstanceOf(DaemonsCollection);
  });

  it("should return a SiteResource", () => {
    const client = createClient();
    const resource = new ServerResource(client, 123);

    expect(resource.site(456)).toBeInstanceOf(SiteResource);
  });

  it("should get server details", async () => {
    const client = createClient({ server: { id: 123, name: "web-1" } });
    const resource = new ServerResource(client, 123);

    const server = await resource.get();
    expect(server.name).toBe("web-1");
  });

  it("should reboot server", async () => {
    const { client, calls } = createTrackingClient();
    const resource = new ServerResource(client, 123);

    await resource.reboot();
    expect(calls[0]!.url).toContain("/servers/123/reboot");
  });

  it("should delete server", async () => {
    const { client, calls } = createTrackingClient();
    const resource = new ServerResource(client, 123);

    await resource.delete();
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain("/servers/123");
  });
});
