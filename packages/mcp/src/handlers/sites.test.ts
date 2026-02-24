import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleSites } from "./sites.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          sites: [{ id: 1, name: "example.com", project_type: "php", status: "installed" }],
          site: {
            id: 1,
            name: "example.com",
            project_type: "php",
            directory: "/public",
            repository: null,
            repository_branch: null,
            status: "installed",
            deployment_status: null,
            quick_deploy: false,
            php_version: "php84",
            created_at: "2024-01-01",
          },
        }),
        post: async () => ({
          site: { id: 2, name: "new.com", project_type: "php", status: "installing" },
        }),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleSites", () => {
  it("should list sites", async () => {
    const result = await handleSites(
      "list",
      { resource: "sites", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("example.com");
  });

  it("should get a site", async () => {
    const result = await handleSites(
      "get",
      { resource: "sites", action: "get", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("example.com");
  });

  it("should create a site", async () => {
    const result = await handleSites(
      "create",
      { resource: "sites", action: "create", server_id: "1", domain: "new.com" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("new.com");
  });

  it("should delete a site", async () => {
    const result = await handleSites(
      "delete",
      { resource: "sites", action: "delete", server_id: "1", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
  });

  it("should require server_id for list", async () => {
    const result = await handleSites(
      "list",
      { resource: "sites", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("server_id");
  });

  it("should handle unknown action", async () => {
    const result = await handleSites(
      "unknown",
      { resource: "sites", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });
});
