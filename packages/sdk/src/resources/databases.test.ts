import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { DatabasesCollection } from "./databases.ts";

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
        json: async () => ({ database: { id: 1, name: "myapp" }, databases: [] }),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("DatabasesCollection", () => {
  it("should list databases", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DatabasesCollection(client, 123);

    await collection.list();
    expect(calls[0]!.url).toContain("/servers/123/databases");
  });

  it("should get a database", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DatabasesCollection(client, 123);

    await collection.get(789);
    expect(calls[0]!.url).toContain("/servers/123/databases/789");
  });

  it("should create a database", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DatabasesCollection(client, 123);

    await collection.create({ name: "myapp", user: "admin", password: "secret" });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toEqual({ name: "myapp", user: "admin", password: "secret" });
  });

  it("should delete a database", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DatabasesCollection(client, 123);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
  });
});
