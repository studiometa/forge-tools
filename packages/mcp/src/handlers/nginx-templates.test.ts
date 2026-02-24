import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleNginxTemplates } from "./nginx-templates.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          templates: [
            { id: 1, name: "wordpress", content: "# WP", server_id: 1, created_at: "2024-01-01" },
          ],
          template: {
            id: 1,
            name: "wordpress",
            content: "server { root /var/www; }",
            server_id: 1,
            created_at: "2024-01-01",
          },
        }),
        post: async () => ({
          template: {
            id: 2,
            name: "laravel",
            content: "server { }",
            server_id: 1,
            created_at: "2024-01-01",
          },
        }),
        put: async () => ({
          template: {
            id: 1,
            name: "wordpress-updated",
            content: "server { root /var/www; }",
            server_id: 1,
            created_at: "2024-01-01",
          },
        }),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleNginxTemplates", () => {
  it("should list nginx templates", async () => {
    const result = await handleNginxTemplates(
      "list",
      { resource: "nginx-templates", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("wordpress");
  });

  it("should get a nginx template", async () => {
    const result = await handleNginxTemplates(
      "get",
      { resource: "nginx-templates", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("wordpress");
  });

  it("should create a nginx template", async () => {
    const result = await handleNginxTemplates(
      "create",
      {
        resource: "nginx-templates",
        action: "create",
        server_id: "1",
        name: "laravel",
        content: "server { }",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("laravel");
  });

  it("should update a nginx template", async () => {
    const result = await handleNginxTemplates(
      "update",
      {
        resource: "nginx-templates",
        action: "update",
        server_id: "1",
        id: "1",
        name: "wordpress-updated",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("wordpress-updated");
  });

  it("should delete a nginx template", async () => {
    const result = await handleNginxTemplates(
      "delete",
      { resource: "nginx-templates", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deleted");
  });

  it("should require server_id for list", async () => {
    const result = await handleNginxTemplates(
      "list",
      { resource: "nginx-templates", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleNginxTemplates(
      "unknown",
      { resource: "nginx-templates", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should inject hints on get when includeHints=true", async () => {
    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleNginxTemplates(
      "get",
      { resource: "nginx-templates", action: "get", server_id: "1", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });
});
