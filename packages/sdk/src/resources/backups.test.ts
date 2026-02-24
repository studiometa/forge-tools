import { describe, expect, it, vi } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { BackupsCollection } from "./backups.ts";

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
          backup: { id: 1, provider: "s3" },
          backups: [],
        }),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("BackupsCollection", () => {
  it("should list backup configurations", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new BackupsCollection(client, 123);

    await collection.list();
    expect(calls[0]!.url).toContain("/servers/123/backup-configs");
  });

  it("should list backup configurations with page option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new BackupsCollection(client, 123);

    await collection.list({ page: 2 });
    expect(calls[0]!.url).toContain("/servers/123/backup-configs?page=2");
  });

  it("should get a backup configuration", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new BackupsCollection(client, 123);

    await collection.get(789);
    expect(calls[0]!.url).toContain("/servers/123/backup-configs/789");
  });

  it("should create a backup configuration", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new BackupsCollection(client, 123);

    await collection.create({
      provider: "s3",
      credentials: { key: "ACCESS_KEY", secret: "SECRET_KEY", region: "us-east-1", bucket: "b" },
      frequency: "weekly",
      databases: [1],
    });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toMatchObject({ provider: "s3" });
  });

  it("should delete a backup configuration", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new BackupsCollection(client, 123);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain("/servers/123/backup-configs/789");
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new BackupsCollection(client, 123);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should iterate all backup configurations across pages via all()", async () => {
    const page1 = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }) as never);
    const page2 = [{ id: 201 } as never];
    const { client } = createTrackingClient();
    const collection = new BackupsCollection(client, 123);

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
