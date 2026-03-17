import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { RecipesCollection } from "./recipes.ts";

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
            name: "Install Node",
            user: "root",
            script: "curl -fsSL ...",
            created_at: "",
            updated_at: "",
          };
          return isId ? mockDocument("1", attrs) : mockListDocument("1", attrs);
        },
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("RecipesCollection", () => {
  it("should list recipes", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client, ORG);

    await collection.list();
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/recipes`);
  });

  it("should list recipes with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client, ORG);

    await collection.list({ cursor: "abc123" });
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/recipes?page[cursor]=abc123`);
  });

  it("should get a recipe", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client, ORG);

    await collection.get(789);
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/recipes/789`);
  });

  it("should create a recipe", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client, ORG);

    await collection.create({ name: "Install Node", script: "curl -fsSL ...", user: "root" });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toMatchObject({ name: "Install Node" });
  });

  it("should delete a recipe", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client, ORG);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/recipes/789`);
  });

  it("should run a recipe on specified servers", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client, ORG);

    await collection.run(789, { servers: [123, 456] });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/recipes/789/run`);
    expect(calls[0]!.body).toMatchObject({ servers: [123, 456] });
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new RecipesCollection(client, ORG);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });
});
