import { describe, expect, it, vi } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { ScheduledJobsCollection } from "./scheduled-jobs.ts";

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
          job: { id: 1, command: "php artisan schedule:run" },
          jobs: [],
        }),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("ScheduledJobsCollection", () => {
  it("should list scheduled jobs", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ScheduledJobsCollection(client, 123);

    await collection.list();
    expect(calls[0]!.url).toContain("/servers/123/jobs");
  });

  it("should list scheduled jobs with page option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ScheduledJobsCollection(client, 123);

    await collection.list({ page: 2 });
    expect(calls[0]!.url).toContain("/servers/123/jobs?page=2");
  });

  it("should get a scheduled job", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ScheduledJobsCollection(client, 123);

    await collection.get(789);
    expect(calls[0]!.url).toContain("/servers/123/jobs/789");
  });

  it("should create a scheduled job", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ScheduledJobsCollection(client, 123);

    await collection.create({
      command: "php artisan schedule:run",
      user: "forge",
      frequency: "minutely",
    });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toMatchObject({ command: "php artisan schedule:run" });
  });

  it("should delete a scheduled job", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ScheduledJobsCollection(client, 123);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain("/servers/123/jobs/789");
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new ScheduledJobsCollection(client, 123);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should iterate all scheduled jobs across pages via all()", async () => {
    const page1 = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }) as never);
    const page2 = [{ id: 201 } as never];
    const { client } = createTrackingClient();
    const collection = new ScheduledJobsCollection(client, 123);

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
