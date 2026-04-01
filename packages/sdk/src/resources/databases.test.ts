import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { toUrlString } from "../test-utils.ts";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { DatabasesCollection } from "./databases.ts";

const ORG = "test-org";

function mockDocument<T>(id: string | number, attributes: T) {
  return { data: { id: String(id), type: "resource", attributes } };
}

const dbAttrs = { name: "myapp", status: "ready", created_at: "", updated_at: "" };

function createTrackingClient(): {
  client: HttpClient;
  calls: Array<{ method: string; url: string; body?: unknown }>;
} {
  const calls: Array<{ method: string; url: string; body?: unknown }> = [];

  const client = new HttpClient({
    token: "test",
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = toUrlString(url);
      calls.push({
        method: init?.method ?? "GET",
        url: urlStr,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });
      const lastSegment = urlStr.split("?")[0].split("/").pop()!;
      const isList = !/^\d+$/.test(lastSegment);
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () =>
          isList
            ? {
                data: [{ id: "1", type: "resource", attributes: dbAttrs }],
                links: {},
                meta: { per_page: 200, next_cursor: null },
              }
            : mockDocument("1", dbAttrs),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("DatabasesCollection", () => {
  it("should list databases", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DatabasesCollection(client, ORG, 123);

    await collection.list();
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/database/schemas`);
  });

  it("should list databases with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DatabasesCollection(client, ORG, 123);

    await collection.list({ cursor: "abc123" });
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/database/schemas?page[cursor]=abc123`);
  });

  it("should get a database", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DatabasesCollection(client, ORG, 123);

    await collection.get(789);
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/database/schemas/789`);
  });

  it("should create a database", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DatabasesCollection(client, ORG, 123);

    await collection.create({ name: "myapp", user: "admin", password: "secret" });
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toEqual({ name: "myapp", user: "admin", password: "secret" });
  });

  it("should delete a database", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DatabasesCollection(client, ORG, 123);

    await collection.delete(789);
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/database/schemas/789`);
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new DatabasesCollection(client, ORG, 123);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should iterate all databases across pages via all()", async () => {
    let callCount = 0;
    const client = new HttpClient({
      token: "test",
      fetch: async () => {
        const items =
          callCount === 0
            ? Array.from({ length: 200 }, (_, i) => ({
                id: String(i + 1),
                type: "resource",
                attributes: {
                  name: `db-${i + 1}`,
                  status: "ready",
                  created_at: "",
                  updated_at: "",
                },
              }))
            : [
                {
                  id: "201",
                  type: "resource",
                  attributes: { name: "db-201", status: "ready", created_at: "", updated_at: "" },
                },
              ];
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
    const collection = new DatabasesCollection(client, ORG, 123);

    const results = await collection.all().toArray();
    expect(results).toHaveLength(201);
  });
});
