import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleRecipes } from "./recipes.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          recipes: [
            { id: 1, name: "deploy", user: "root", script: "cd /app", created_at: "2024-01-01" },
          ],
          recipe: {
            id: 1,
            name: "deploy",
            user: "root",
            script: "cd /app && npm install",
            created_at: "2024-01-01",
          },
        }),
        post: async () => ({
          recipe: {
            id: 2,
            name: "cleanup",
            user: "forge",
            script: "rm -rf /tmp/*",
            created_at: "2024-01-01",
          },
        }),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleRecipes", () => {
  it("should list recipes", async () => {
    const result = await handleRecipes(
      "list",
      { resource: "recipes", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deploy");
  });

  it("should get a recipe", async () => {
    const result = await handleRecipes(
      "get",
      { resource: "recipes", action: "get", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deploy");
  });

  it("should create a recipe", async () => {
    const result = await handleRecipes(
      "create",
      { resource: "recipes", action: "create", name: "cleanup", script: "rm -rf /tmp/*" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("cleanup");
  });

  it("should delete a recipe", async () => {
    const result = await handleRecipes(
      "delete",
      { resource: "recipes", action: "delete", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
  });

  it("should run a recipe", async () => {
    const result = await handleRecipes(
      "run",
      { resource: "recipes", action: "run", id: "1", servers: [1, 2, 3] },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("run on 3 server(s)");
  });

  it("should require id for get", async () => {
    const result = await handleRecipes(
      "get",
      { resource: "recipes", action: "get" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleRecipes(
      "unknown",
      { resource: "recipes", action: "unknown" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should inject hints on get when includeHints=true", async () => {
    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleRecipes("get", { resource: "recipes", action: "get", id: "1" }, ctx);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });
});
