import { describe, expect, it, vi } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { SecurityRulesCollection } from "./security-rules.ts";

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
        json: async () => ({
          security_rule: { id: 1, name: "Admin Area" },
          security_rules: [],
        }),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("SecurityRulesCollection", () => {
  it("should list security rules", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SecurityRulesCollection(client, 123, 456);

    await collection.list();
    expect(calls[0]!.url).toContain("/servers/123/sites/456/security-rules");
  });

  it("should list security rules with page option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SecurityRulesCollection(client, 123, 456);

    await collection.list({ page: 2 });
    expect(calls[0]!.url).toContain("/servers/123/sites/456/security-rules?page=2");
  });

  it("should get a security rule", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SecurityRulesCollection(client, 123, 456);

    await collection.get(789);
    expect(calls[0]!.url).toContain("/servers/123/sites/456/security-rules/789");
  });

  it("should create a security rule", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SecurityRulesCollection(client, 123, 456);

    await collection.create({
      name: "Admin Area",
      path: "/admin",
      credentials: [{ username: "admin", password: "secret" }],
    });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toMatchObject({ name: "Admin Area" });
  });

  it("should delete a security rule", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SecurityRulesCollection(client, 123, 456);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain("/servers/123/sites/456/security-rules/789");
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new SecurityRulesCollection(client, 123, 456);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should iterate all security rules across pages via all()", async () => {
    const page1 = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }) as never);
    const page2 = [{ id: 201 } as never];
    const { client } = createTrackingClient();
    const collection = new SecurityRulesCollection(client, 123, 456);

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
