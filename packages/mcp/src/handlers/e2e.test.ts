/**
 * End-to-end tests for the full MCP tool call flow.
 *
 * These test the entire pipeline: executeToolWithCredentials → handler routing → executor → response.
 * Uses mock HTTP client via DI.
 */
import { describe, expect, it, vi } from "vitest";

import { executeToolWithCredentials } from "./index.ts";

// Mock the HttpClient constructor to return a mock client
vi.mock("@studiometa/forge-api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@studiometa/forge-api")>();
  return {
    ...mod,
    HttpClient: class MockHttpClient {
      async get(path: string) {
        if (path === "/servers") {
          return {
            servers: [
              {
                id: 1,
                name: "web-1",
                provider: "hetzner",
                region: "eu",
                ip_address: "1.2.3.4",
                is_ready: true,
              },
            ],
          };
        }
        if (path.match(/^\/servers\/\d+$/)) {
          return {
            server: {
              id: 1,
              name: "web-1",
              provider: "hetzner",
              region: "eu",
              ip_address: "1.2.3.4",
              is_ready: true,
              php_version: "php84",
              ubuntu_version: "24.04",
              created_at: "2024-01-01",
            },
          };
        }
        if (path.match(/^\/servers\/\d+\/sites$/)) {
          return {
            sites: [
              {
                id: 10,
                name: "example.com",
                project_type: "php",
                status: "installed",
                deployment_status: null,
                directory: "/public",
                repository: null,
                repository_branch: null,
                quick_deploy: false,
                php_version: "php84",
                created_at: "2024-01-01",
              },
            ],
          };
        }
        if (path.match(/^\/servers\/\d+\/databases$/)) {
          return {
            databases: [{ id: 5, name: "myapp", status: "installed" }],
          };
        }
        if (path.match(/^\/servers\/\d+\/sites\/\d+\/env$/)) {
          return "APP_ENV=production";
        }
        return {};
      }
      async post() {
        return { server: { id: 1, name: "new", is_ready: false } };
      }
      async put() {
        return {};
      }
      async delete() {
        return undefined;
      }
    },
  };
});

const creds = { apiToken: "test-token" };

describe("E2E: executeToolWithCredentials", () => {
  it("should return error for missing resource/action", async () => {
    const result = await executeToolWithCredentials("forge", {}, creds);
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("resource");
  });

  it("should return error for unknown resource", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "unknown", action: "list" },
      creds,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown resource");
  });

  it("should handle help action without API call", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.resource).toBe("servers");
  });

  it("should handle schema action without API call", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "sites", action: "schema" },
      creds,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.resource).toBe("sites");
  });

  it("should list servers end-to-end", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "list" },
      creds,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("web-1");
  });

  it("should get a server end-to-end", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "get", id: "1" },
      creds,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("web-1");
  });

  it("should list sites with server_id end-to-end", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "sites", action: "list", server_id: "1" },
      creds,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("example.com");
  });

  it("should list databases end-to-end", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "databases", action: "list", server_id: "1" },
      creds,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("myapp");
  });

  it("should get env end-to-end", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "env", action: "get", server_id: "1", site_id: "10" },
      creds,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("APP_ENV=production");
  });

  it("should reject path traversal in server_id", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "sites", action: "list", server_id: "../etc" },
      creds,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Invalid");
  });

  it("should reject path traversal in id", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "get", id: "1/../../secrets" },
      creds,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Invalid");
  });

  it("should return missing field error for sites without server_id", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "sites", action: "list" },
      creds,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("server_id");
  });
});
