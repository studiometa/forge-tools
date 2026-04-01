import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { RedirectRulesCollection } from "./redirect-rules.ts";

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
            from: "/old",
            to: "/new",
            type: "redirect",
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

describe("RedirectRulesCollection", () => {
  it("should list redirect rules", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RedirectRulesCollection(client, ORG, 123, 456);

    await collection.list();
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/sites/456/redirect-rules`);
  });

  it("should list redirect rules with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RedirectRulesCollection(client, ORG, 123, 456);

    await collection.list({ cursor: "abc123" });
    expect(calls[0].url).toContain(
      `/orgs/${ORG}/servers/123/sites/456/redirect-rules?page[cursor]=abc123`,
    );
  });

  it("should get a redirect rule", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RedirectRulesCollection(client, ORG, 123, 456);

    await collection.get(789);
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/sites/456/redirect-rules/789`);
  });

  it("should create a redirect rule", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RedirectRulesCollection(client, ORG, 123, 456);

    await collection.create({ from: "/old-path", to: "/new-path", type: "redirect" });
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toMatchObject({ from: "/old-path", to: "/new-path" });
  });

  it("should delete a redirect rule", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RedirectRulesCollection(client, ORG, 123, 456);

    await collection.delete(789);
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/sites/456/redirect-rules/789`);
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new RedirectRulesCollection(client, ORG, 123, 456);

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
                attributes: { from: "/old" },
              }))
            : [{ id: "201", type: "resource", attributes: { from: "/old" } }];
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
    const collection = new RedirectRulesCollection(client, ORG, 123, 456);

    const results = await collection.all().toArray();
    expect(results).toHaveLength(201);
  });
});
