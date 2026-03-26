import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { BackupsCollection } from "./backups.ts";

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
            day_of_week: null,
            time: null,
            provider: "s3",
            provider_name: "S3",
            frequency: "weekly",
            directory: null,
            email: null,
            retention: 7,
            status: "active",
            last_backup_time: null,
          };
          return isId ? mockDocument("1", attrs) : mockListDocument("1", attrs);
        },
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("BackupsCollection", () => {
  it("should list backup configurations", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new BackupsCollection(client, ORG, 123);

    await collection.list();
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/database/backups`);
  });

  it("should list backup configurations with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new BackupsCollection(client, ORG, 123);

    await collection.list({ cursor: "abc123" });
    expect(calls[0]!.url).toContain(
      `/orgs/${ORG}/servers/123/database/backups?page[cursor]=abc123`,
    );
  });

  it("should get a backup configuration", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new BackupsCollection(client, ORG, 123);

    await collection.get(789);
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/database/backups/789`);
  });

  it("should create a backup configuration", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new BackupsCollection(client, ORG, 123);

    await collection.create({
      provider: "s3",
      credentials: { key: "ACCESS_KEY", secret: "SECRET_KEY", region: "us-east-1", bucket: "b" },
      frequency: "weekly",
      databases: [1],
    });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toMatchObject({ provider: "s3" });
  });

  it("should delete a backup configuration", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new BackupsCollection(client, ORG, 123);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/database/backups/789`);
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new BackupsCollection(client, ORG, 123);

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
                attributes: { provider: "s3" },
              }))
            : [{ id: "201", type: "resource", attributes: { provider: "s3" } }];
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
    const collection = new BackupsCollection(client, ORG, 123);

    const results = await collection.all().toArray();
    expect(results).toHaveLength(201);
  });
});
