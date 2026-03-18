import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { FirewallRulesCollection } from "./firewall-rules.ts";

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
            name: "Allow HTTP",
            port: 80,
            type: "allow",
            ip_address: "",
            status: "created",
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

describe("FirewallRulesCollection", () => {
  it("should list firewall rules", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new FirewallRulesCollection(client, ORG, 123);

    await collection.list();
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/firewall-rules`);
  });

  it("should list firewall rules with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new FirewallRulesCollection(client, ORG, 123);

    await collection.list({ cursor: "abc123" });
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/firewall-rules?page[cursor]=abc123`);
  });

  it("should get a firewall rule", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new FirewallRulesCollection(client, ORG, 123);

    await collection.get(789);
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/firewall-rules/789`);
  });

  it("should create a firewall rule", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new FirewallRulesCollection(client, ORG, 123);

    await collection.create({ name: "Allow HTTP", port: 80 });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toMatchObject({ name: "Allow HTTP", port: 80 });
  });

  it("should delete a firewall rule", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new FirewallRulesCollection(client, ORG, 123);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain(`/orgs/${ORG}/servers/123/firewall-rules/789`);
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new FirewallRulesCollection(client, ORG, 123);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });
});
