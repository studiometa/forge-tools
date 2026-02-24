import { describe, expect, it, vi } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { SshKeysCollection } from "./ssh-keys.ts";

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
          key: { id: 1, name: "deploy-key" },
          keys: [],
        }),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("SshKeysCollection", () => {
  it("should list SSH keys", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SshKeysCollection(client, 123);

    await collection.list();
    expect(calls[0]!.url).toContain("/servers/123/keys");
  });

  it("should list SSH keys with page option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SshKeysCollection(client, 123);

    await collection.list({ page: 2 });
    expect(calls[0]!.url).toContain("/servers/123/keys?page=2");
  });

  it("should get an SSH key", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SshKeysCollection(client, 123);

    await collection.get(789);
    expect(calls[0]!.url).toContain("/servers/123/keys/789");
  });

  it("should create an SSH key", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SshKeysCollection(client, 123);

    await collection.create({ name: "deploy-key", key: "ssh-rsa AAAA..." });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toMatchObject({ name: "deploy-key" });
  });

  it("should delete an SSH key", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new SshKeysCollection(client, 123);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain("/servers/123/keys/789");
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new SshKeysCollection(client, 123);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should iterate all SSH keys across pages via all()", async () => {
    const page1 = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }) as never);
    const page2 = [{ id: 201 } as never];
    const { client } = createTrackingClient();
    const collection = new SshKeysCollection(client, 123);

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
