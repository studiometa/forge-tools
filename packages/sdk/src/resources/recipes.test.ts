import { describe, expect, it, vi } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { AsyncPaginatedIterator } from "../pagination.ts";
import { RecipesCollection } from "./recipes.ts";

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
          recipe: { id: 1, name: "Install Node" },
          recipes: [],
        }),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("RecipesCollection", () => {
  it("should list recipes", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client);

    await collection.list();
    expect(calls[0]!.url).toContain("/recipes");
  });

  it("should list recipes with page option", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client);

    await collection.list({ page: 2 });
    expect(calls[0]!.url).toContain("/recipes?page=2");
  });

  it("should get a recipe", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client);

    await collection.get(789);
    expect(calls[0]!.url).toContain("/recipes/789");
  });

  it("should create a recipe", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client);

    await collection.create({ name: "Install Node", script: "curl -fsSL ...", user: "root" });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.body).toMatchObject({ name: "Install Node" });
  });

  it("should delete a recipe", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client);

    await collection.delete(789);
    expect(calls[0]!.method).toBe("DELETE");
    expect(calls[0]!.url).toContain("/recipes/789");
  });

  it("should run a recipe on specified servers", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new RecipesCollection(client);

    await collection.run(789, { servers: [123, 456] });
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.url).toContain("/recipes/789/run");
    expect(calls[0]!.body).toMatchObject({ servers: [123, 456] });
  });

  it("should return an AsyncPaginatedIterator from all()", () => {
    const { client } = createTrackingClient();
    const collection = new RecipesCollection(client);

    const iter = collection.all();
    expect(iter).toBeInstanceOf(AsyncPaginatedIterator);
  });

  it("should iterate all recipes across pages via all()", async () => {
    const page1 = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }) as never);
    const page2 = [{ id: 201 } as never];
    const { client } = createTrackingClient();
    const collection = new RecipesCollection(client);

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
