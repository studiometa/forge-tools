import { describe, expect, it, vi } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { DeploymentsCollection } from "./deployments.ts";

function createTrackingClient(jsonBody: unknown = { deployment: { id: 789 }, deployments: [] }): {
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
        json: async () => jsonBody,
        text: async () => "deploy output text",
      } as Response;
    },
  });

  return { client, calls };
}

describe("DeploymentsCollection", () => {
  it("should list deployments", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DeploymentsCollection(client, 123, 456);

    await collection.list();
    expect(calls[0]!.url).toContain("/servers/123/sites/456/deployments");
  });

  it("should list deployments with page option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DeploymentsCollection(client, 123, 456);

    await collection.list({ page: 2 });
    expect(calls[0]!.url).toContain("/servers/123/sites/456/deployments?page=2");
  });

  it("should get a deployment", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DeploymentsCollection(client, 123, 456);

    await collection.get(789);
    expect(calls[0]!.url).toContain("/servers/123/sites/456/deployments/789");
  });

  it("should get deployment output", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DeploymentsCollection(client, 123, 456);

    await collection.output(789);
    expect(calls[0]!.url).toContain("/servers/123/sites/456/deployments/789/output");
  });

  it("should get deployment script", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DeploymentsCollection(client, 123, 456);

    await collection.script();
    expect(calls[0]!.url).toContain("/servers/123/sites/456/deployment/script");
  });

  it("should update deployment script", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DeploymentsCollection(client, 123, 456);

    await collection.updateScript("npm run build");
    expect(calls[0]!.method).toBe("PUT");
    expect(calls[0]!.body).toEqual({ content: "npm run build" });
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new DeploymentsCollection(client, 123, 456);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should iterate all deployments across pages via all()", async () => {
    const page1 = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }) as never);
    const page2 = [{ id: 201 } as never];

    let callCount = 0;
    const { client } = createTrackingClient({
      deployments: callCount++ === 0 ? page1 : page2,
    });
    const collection = new DeploymentsCollection(client, 123, 456);

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
