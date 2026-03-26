import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { DaemonsCollection } from "./daemons.ts";

const ORG = "test-org";

function mockDocument<T>(id: string | number, attributes: T) {
  return { data: { id: String(id), type: "resource", attributes } };
}

const daemonAttrs = {
  command: "php artisan queue:work",
  user: "forge",
  directory: null,
  processes: 1,
  startsecs: 1,
  stopsignal: "TERM",
  stopwaitsecs: 10,
  status: "running",
  created_at: "",
  updated_at: "",
};

function createTrackingClient(): {
  client: HttpClient;
  calls: Array<{ method: string; url: string; body?: unknown }>;
} {
  const calls: Array<{ method: string; url: string; body?: unknown }> = [];

  const client = new HttpClient({
    token: "test",
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = url.toString();
      calls.push({
        method: init?.method ?? "GET",
        url: urlStr,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });
      // Return list document for list endpoints, single document for others
      const lastSegment = urlStr.split("?")[0]!.split("/").pop()!;
      const isList = !/^\d+$/.test(lastSegment);
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () =>
          isList
            ? {
                data: [{ id: "1", type: "resource", attributes: daemonAttrs }],
                links: {},
                meta: { per_page: 200, next_cursor: null },
              }
            : mockDocument("1", daemonAttrs),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("DaemonsCollection", () => {
  it("should list daemons", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DaemonsCollection(client, ORG, 123);

    await collection.list();
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/background-processes`);
  });

  it("should list daemons with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DaemonsCollection(client, ORG, 123);

    await collection.list({ cursor: "abc123" });
    expect(calls[0]!.url).toContain(
      `/orgs/${ORG}/servers/123/background-processes?page[cursor]=abc123`,
    );
  });

  it("should get a daemon", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DaemonsCollection(client, ORG, 123);

    await collection.get(789);
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/background-processes/789`);
  });

  it("should create a daemon", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DaemonsCollection(client, ORG, 123);

    await collection.create({ command: "php artisan queue:work", user: "forge" });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toEqual({ command: "php artisan queue:work", user: "forge" });
  });

  it("should delete a daemon", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DaemonsCollection(client, ORG, 123);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/background-processes/789`);
  });

  it("should restart a daemon", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DaemonsCollection(client, ORG, 123);

    await collection.restart(789);
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/background-processes/789/restart`);
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new DaemonsCollection(client, ORG, 123);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
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
                attributes: { command: "php artisan queue:work" },
              }))
            : [{ id: "201", type: "resource", attributes: { command: "php artisan queue:work" } }];
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
    const collection = new DaemonsCollection(client, ORG, 123);

    const results = await collection.all().toArray();
    expect(results).toHaveLength(201);
  });
});
