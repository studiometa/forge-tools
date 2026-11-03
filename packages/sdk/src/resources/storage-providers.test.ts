import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { toUrlString } from "../test-utils.ts";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { StorageProvidersCollection } from "./storage-providers.ts";

const ORG = "test-org";

const attrs = {
  name: "Backups",
  provider: "custom",
  provider_name: "Custom (S3 Compatible)",
  region: "eu-west-1",
  bucket: "my-bucket",
  directory: null,
  endpoint: "https://s3.example.com",
  assume_role: false,
  in_use: false,
  created_at: "",
  updated_at: "",
};

function createTrackingClient(nextCursors: Array<string | null> = [null]): {
  client: HttpClient;
  calls: Array<{ method: string; url: string; body?: unknown }>;
} {
  const calls: Array<{ method: string; url: string; body?: unknown }> = [];

  const client = new HttpClient({
    token: "test",
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
      const u = toUrlString(url);
      calls.push({
        method: init?.method ?? "GET",
        url: u,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });
      const isId = /\/\d+(\?|$)/.test(u);
      const nextCursor = nextCursors[calls.length - 1] ?? null;
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () =>
          isId
            ? { data: { id: "1", type: "storageProviders", attributes: attrs } }
            : {
                data: [{ id: String(calls.length), type: "storageProviders", attributes: attrs }],
                links: {},
                meta: { per_page: 30, next_cursor: nextCursor },
              },
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("StorageProvidersCollection", () => {
  it("should list storage providers", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new StorageProvidersCollection(client, ORG);

    const providers = await collection.list();
    expect(calls[0].url).toContain(`/orgs/${ORG}/storage-providers`);
    expect(providers[0]).toMatchObject({ id: 1, name: "Backups" });
  });

  it("should list storage providers with cursor option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new StorageProvidersCollection(client, ORG);

    await collection.list({ cursor: "abc123" });
    expect(calls[0].url).toContain(`/orgs/${ORG}/storage-providers?page[cursor]=abc123`);
  });

  it("should get a storage provider", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new StorageProvidersCollection(client, ORG);

    await collection.get(12);
    expect(calls[0].url).toContain(`/orgs/${ORG}/storage-providers/12`);
  });

  it("should create a storage provider", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new StorageProvidersCollection(client, ORG);

    await collection.create({
      name: "Backups",
      provider: "custom",
      endpoint: "https://s3.example.com",
      region: "eu-west-1",
      access_key: "access",
      secret_key: "secret",
    });
    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toContain(`/orgs/${ORG}/storage-providers`);
    expect(calls[0].body).toMatchObject({ name: "Backups", provider: "custom" });
  });

  it("should delete a storage provider", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new StorageProvidersCollection(client, ORG);

    await collection.delete(12);
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].url).toContain(`/orgs/${ORG}/storage-providers/12`);
  });

  it("should iterate all items across pages via all()", async () => {
    const { client, calls } = createTrackingClient(["cursor-2", null]);
    const collection = new StorageProvidersCollection(client, ORG);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
    const results = await iter.toArray();
    expect(results).toHaveLength(2);
    expect(calls[1].url).toContain("page[cursor]=cursor-2");
  });
});
