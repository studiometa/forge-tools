import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { resolveSites } from "./resolve.ts";

const siteAttrs = {
  aliases: [],
  root_directory: "/home/forge/site",
  web_directory: "/home/forge/site/public",
  wildcards: false,
  status: "installed",
  repository: null,
  quick_deploy: false,
  deployment_status: null,
  deployment_url: "https://site/deploy",
  deployment_script: null,
  php_version: "php83",
  app_type: null,
  url: "https://site",
  https: false,
  isolated: false,
  user: null,
  database: null,
  shared_paths: [],
  uses_envoyer: false,
  zero_downtime_deployments: false,
  maintenance_mode: false,
  healthcheck_url: null,
  created_at: "2024-01-01T00:00:00.000000Z",
  updated_at: "2024-01-01T00:00:00.000000Z",
};

function createCtx() {
  return createTestExecutorContext({
    client: {
      get: async () =>
        mockListDocument("sites", [
          { id: 1, attributes: { ...siteAttrs, name: "example.com" } },
          { id: 2, attributes: { ...siteAttrs, name: "api.example.com" } },
          { id: 3, attributes: { ...siteAttrs, name: "staging.myapp.io" } },
        ]),
    } as never,
    organizationSlug: "test-org",
  });
}

describe("resolveSites", () => {
  it("should return partial matches", async () => {
    const result = await resolveSites({ server_id: "123", query: "example" }, createCtx());
    expect(result.data.query).toBe("example");
    expect(result.data.total).toBe(2);
    expect(result.data.matches).toHaveLength(2);
    expect(result.data.matches[0]!.name).toBe("example.com");
    expect(result.data.matches[1]!.name).toBe("api.example.com");
  });

  it("should return exact match as single result", async () => {
    const result = await resolveSites({ server_id: "123", query: "example.com" }, createCtx());
    expect(result.data.total).toBe(1);
    expect(result.data.matches).toHaveLength(1);
    expect(result.data.matches[0]!.id).toBe(1);
    expect(result.data.matches[0]!.name).toBe("example.com");
  });

  it("should return empty for no matches", async () => {
    const result = await resolveSites({ server_id: "123", query: "nonexistent" }, createCtx());
    expect(result.data.total).toBe(0);
    expect(result.data.matches).toHaveLength(0);
  });

  it("should be case insensitive", async () => {
    const result = await resolveSites({ server_id: "123", query: "EXAMPLE" }, createCtx());
    expect(result.data.total).toBe(2);
  });

  it("should use server_id in the API path", async () => {
    let capturedPath = "";
    const ctx = createTestExecutorContext({
      client: {
        get: async (path: string) => {
          capturedPath = path;
          return mockListDocument("sites", []);
        },
      } as never,
      organizationSlug: "test-org",
    });
    await resolveSites({ server_id: "456", query: "test" }, ctx);
    expect(capturedPath).toBe("/orgs/test-org/servers/456/sites");
  });

  it("should return partial matches when multiple exact-like names exist", async () => {
    const ctxWithDupes = createTestExecutorContext({
      client: {
        get: async () =>
          mockListDocument("sites", [
            { id: 1, attributes: { ...siteAttrs, name: "example.com" } },
            { id: 2, attributes: { ...siteAttrs, name: "example.com" } },
          ]),
      } as never,
      organizationSlug: "test-org",
    });
    // Two exact matches → fall through to partial match
    const result = await resolveSites({ server_id: "123", query: "example.com" }, ctxWithDupes);
    expect(result.data.total).toBe(2);
    expect(result.data.matches).toHaveLength(2);
  });
});
