import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleRecipes } from "./recipes.ts";

function makeRecipeAttrs(overrides: Record<string, unknown> = {}) {
  return {
    name: "deploy",
    user: "root",
    script: "cd /app && npm install",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    ...overrides,
  };
}

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          if (/\/recipes\/\d+$/.test(url)) {
            return mockDocument(1, "recipes", makeRecipeAttrs());
          }
          return mockListDocument("recipes", [
            { id: 1, attributes: makeRecipeAttrs({ script: "cd /app" }) as never },
          ]);
        },
        post: async (url: string) => {
          // run action posts to /run endpoint
          if (url.endsWith("/run")) {
            return {};
          }
          return mockDocument(
            2,
            "recipes",
            makeRecipeAttrs({ name: "cleanup", user: "forge", script: "rm -rf /tmp/*" }),
          );
        },
        put: async () => mockDocument(1, "recipes", makeRecipeAttrs({ name: "updated" })),
        delete: async () => {},
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
    expect(result.content[0].text).toContain("deploy");
  });

  it("should get a recipe", async () => {
    const result = await handleRecipes(
      "get",
      { resource: "recipes", action: "get", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("deploy");
  });

  it("should create a recipe", async () => {
    const result = await handleRecipes(
      "create",
      { resource: "recipes", action: "create", name: "cleanup", script: "rm -rf /tmp/*" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("cleanup");
  });

  it("should delete a recipe", async () => {
    const result = await handleRecipes(
      "delete",
      { resource: "recipes", action: "delete", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("deleted");
  });

  it("should run a recipe", async () => {
    const result = await handleRecipes(
      "run",
      { resource: "recipes", action: "run", id: "1", servers: [1, 2, 3] },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("run on 3 server(s)");
  });

  it("should require id for get", async () => {
    const result = await handleRecipes(
      "get",
      { resource: "recipes", action: "get" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should update a recipe", async () => {
    const result = await handleRecipes(
      "update",
      { resource: "recipes", action: "update", id: "1", name: "updated", script: "echo hi" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("updated");
  });

  it("should handle unknown action", async () => {
    const result = await handleRecipes(
      "unknown",
      { resource: "recipes", action: "unknown" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should run a recipe on a single server (non-array servers)", async () => {
    const result = await handleRecipes(
      "run",
      { resource: "recipes", action: "run", id: "1", servers: 99 },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("1 server(s)");
  });

  it("should inject hints on get when includeHints=true", async () => {
    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleRecipes("get", { resource: "recipes", action: "get", id: "1" }, ctx);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });
});
