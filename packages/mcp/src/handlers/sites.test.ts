import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleSites } from "./sites.ts";

function makeSiteAttrs(overrides: Record<string, unknown> = {}) {
  return {
    name: "example.com",
    app_type: "php",
    status: "installed",
    aliases: [],
    root_directory: "/public",
    web_directory: "/public",
    wildcards: false,
    repository: null,
    quick_deploy: false,
    deployment_status: null,
    deployment_url: "",
    deployment_script: null,
    php_version: "php84",
    url: "",
    https: false,
    isolated: false,
    user: null,
    database: null,
    shared_paths: [],
    uses_envoyer: false,
    zero_downtime_deployments: false,
    maintenance_mode: false,
    healthcheck_url: null,
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
          if (url.match(/\/sites\/\d+$/)) {
            return mockDocument(1, "sites", makeSiteAttrs());
          }
          return mockListDocument("sites", [{ id: 1, attributes: makeSiteAttrs() as never }]);
        },
        post: async () =>
          mockDocument(2, "sites", makeSiteAttrs({ name: "new.com", status: "installing" })),
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

  it("should inject hints on get when includeHints=true", async () => {
    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleSites(
      "get",
      { resource: "sites", action: "get", server_id: "1", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });

  it("should handle context action", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        organizationSlug: "test-org",
        client: {
          get: async (url: string) => {
            if (url.match(/\/sites\/\d+\/deployments/))
              return mockListDocument("deployments", [
                {
                  id: 1,
                  attributes: {
                    commit: { hash: "abc", author: null, message: null, branch: null },
                    status: "finished",
                    type: "push",
                    started_at: "2024-01-01",
                    ended_at: null,
                    created_at: "2024-01-01",
                    updated_at: "2024-01-01",
                  } as never,
                },
                {
                  id: 2,
                  attributes: {
                    commit: { hash: "def", author: null, message: null, branch: null },
                    status: "finished",
                    type: "push",
                    started_at: "2024-01-01",
                    ended_at: null,
                    created_at: "2024-01-01",
                    updated_at: "2024-01-01",
                  } as never,
                },
              ]);
            if (url.match(/\/sites\/\d+\/certificates$/))
              return mockListDocument("certificates", []);
            if (url.match(/\/sites\/\d+\/redirect-rules$/))
              return mockListDocument("redirect-rules", []);
            if (url.match(/\/sites\/\d+\/security-rules$/))
              return mockListDocument("security-rules", []);
            if (url.match(/\/sites\/\d+$/)) return mockDocument(1, "sites", makeSiteAttrs());
            return {};
          },
        } as never,
      },
      compact: false,
    };
    const result = await handleSites(
      "context",
      { resource: "sites", action: "context", server_id: "1", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.site).toBeDefined();
    expect(data.deployments).toBeDefined();
    expect(data.certificates).toBeDefined();
  });

  it("should resolve sites by domain name (partial match)", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        organizationSlug: "test-org",
        client: {
          get: async () =>
            mockListDocument("sites", [
              { id: 1, attributes: { name: "example.com" } as never },
              { id: 2, attributes: { name: "api.example.com" } as never },
              { id: 3, attributes: { name: "staging.myapp.io" } as never },
            ]),
        } as never,
      },
      compact: true,
    };
    const result = await handleSites(
      "resolve",
      { resource: "sites", action: "resolve", server_id: "123", query: "example" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("example.com");
    expect(result.content[0]!.text).toContain("api.example.com");
    expect(result.content[0]!.text).toContain("2 site(s)");
  });

  it("should resolve sites — no matches", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        organizationSlug: "test-org",
        client: {
          get: async () =>
            mockListDocument("sites", [
              { id: 1, attributes: { name: "staging.myapp.io" } as never },
            ]),
        } as never,
      },
      compact: true,
    };
    const result = await handleSites(
      "resolve",
      { resource: "sites", action: "resolve", server_id: "123", query: "example" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain('No sites matching "example"');
  });

  it("should require server_id and query for resolve", async () => {
    const result = await handleSites(
      "resolve",
      { resource: "sites", action: "resolve", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("query");
  });
});
