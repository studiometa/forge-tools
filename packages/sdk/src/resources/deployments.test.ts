import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { DeploymentsCollection } from "./deployments.ts";

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
        json: async () => ({ deployment: { id: 789 }, deployments: [] }),
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
});
