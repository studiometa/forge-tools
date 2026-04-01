import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { DeploymentsCollection } from "./deployments.ts";

const ORG = "test-org";

function mockDocument<T>(id: string | number, attributes: T) {
  return {
    data: { id: String(id), type: "resource", attributes },
  };
}

const deploymentAttrs = {
  commit: { hash: null, author: null, message: null, branch: null },
  status: "finished",
  type: "deployment",
  started_at: "2024-01-01T00:00:00Z",
  ended_at: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

function createTrackingClient(): {
  client: HttpClient;
  calls: Array<{ method: string; url: string; body?: unknown }>;
} {
  const calls: Array<{ method: string; url: string; body?: unknown }> = [];

  const client = new HttpClient({
    token: "test",
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = url.toString();
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
                data: [{ id: "789", type: "resource", attributes: deploymentAttrs }],
                links: {},
                meta: { per_page: 200, next_cursor: null },
              }
            : mockDocument("789", deploymentAttrs),
        text: async () => "deploy output text",
      } as Response;
    },
  });

  return { client, calls };
}

describe("DeploymentsCollection", () => {
  it("should list deployments", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DeploymentsCollection(client, ORG, 123, 456);

    await collection.list();
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/sites/456/deployments`);
  });

  it("should list deployments with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DeploymentsCollection(client, ORG, 123, 456);

    await collection.list({ cursor: "abc123" });
    expect(calls[0].url).toContain("/deployments?");
    expect(calls[0].url).toContain("sort=-created_at");
    expect(calls[0].url).toContain("page%5Bcursor%5D=abc123");
  });

  it("should get a deployment", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DeploymentsCollection(client, ORG, 123, 456);

    await collection.get(789);
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/sites/456/deployments/789`);
  });

  it("should get deployment output", async () => {
    const outputClient = new HttpClient({
      token: "test",
      fetch: async () =>
        ({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockDocument("789", { output: "deploy output text" }),
          text: async () => "{}",
        }) as Response,
    });
    const collection = new DeploymentsCollection(outputClient, ORG, 123, 456);

    const output = await collection.output(789);
    expect(output).toBe("deploy output text");
  });

  it("should get deployment script", async () => {
    const calls: string[] = [];
    const trackingClient = new HttpClient({
      token: "test",
      fetch: async (url: string | URL | Request) => {
        calls.push(url.toString());
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockDocument("1", { content: "npm run build" }),
          text: async () => "{}",
        } as Response;
      },
    });
    const collection = new DeploymentsCollection(trackingClient, ORG, 123, 456);

    const script = await collection.script();
    expect(script).toBe("npm run build");
    expect(calls[0]).toContain(`/orgs/${ORG}/servers/123/sites/456/deployments/script`);
  });

  it("should update deployment script", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new DeploymentsCollection(client, ORG, 123, 456);

    await collection.updateScript("npm run build");
    expect(calls[0].method).toBe("PUT");
    expect(calls[0].body).toEqual({ content: "npm run build" });
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/sites/456/deployments/script`);
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new DeploymentsCollection(client, ORG, 123, 456);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should iterate all deployments across pages via all()", async () => {
    let callCount = 0;
    const client = new HttpClient({
      token: "test",
      fetch: async () => {
        const items =
          callCount === 0
            ? Array.from({ length: 200 }, (_, i) => ({
                id: String(i + 1),
                type: "resource",
                attributes: { status: "finished" },
              }))
            : [{ id: "201", type: "resource", attributes: { status: "finished" } }];
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
    const collection = new DeploymentsCollection(client, ORG, 123, 456);

    const results = await collection.all().toArray();
    expect(results).toHaveLength(201);
  });
});
