import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { MonitorsCollection } from "./monitors.ts";

const ORG = "test-org";

function mockDocument<T>(id: string | number, attributes: T) {
  return { data: { id: String(id), type: "resource", attributes } };
}

function mockListDocument<T>(id: string | number, attributes: T) {
  return {
    data: [{ id: String(id), type: "resource", attributes }],
    links: {},
    meta: { per_page: 200, next_cursor: null },
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
        json: async () => {
          const u = url.toString();
          const isId = /\/\d+(\?|$)/.test(u);
          const attrs = {
            type: "cpu_load",
            operator: "gte",
            threshold: 80,
            minutes: 5,
            state: "OK",
            state_changed_at: "",
          };
          return isId ? mockDocument("1", attrs) : mockListDocument("1", attrs);
        },
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("MonitorsCollection", () => {
  it("should list monitors", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new MonitorsCollection(client, ORG, 123);

    await collection.list();
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/monitors`);
  });

  it("should list monitors with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new MonitorsCollection(client, ORG, 123);

    await collection.list({ cursor: "abc123" });
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/monitors?page[cursor]=abc123`);
  });

  it("should get a monitor", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new MonitorsCollection(client, ORG, 123);

    await collection.get(789);
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/monitors/789`);
  });

  it("should create a monitor", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new MonitorsCollection(client, ORG, 123);

    await collection.create({ type: "cpu_load", operator: "gte", threshold: 80, minutes: 5 });
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toMatchObject({ type: "cpu_load" });
  });

  it("should delete a monitor", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new MonitorsCollection(client, ORG, 123);

    await collection.delete(789);
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/monitors/789`);
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new MonitorsCollection(client, ORG, 123);

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
                attributes: { type: "cpu_load" },
              }))
            : [{ id: "201", type: "resource", attributes: { type: "cpu_load" } }];
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
    const collection = new MonitorsCollection(client, ORG, 123);

    const results = await collection.all().toArray();
    expect(results).toHaveLength(201);
  });
});
