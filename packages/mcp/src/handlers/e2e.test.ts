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

  // Route coverage for all resources
  it("should route to nginx handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "nginx", action: "get", server_id: "1", site_id: "10" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to certificates handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "certificates", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to daemons handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "daemons", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to firewall-rules handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "firewall-rules", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to ssh-keys handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "ssh-keys", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to security-rules handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "security-rules", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to redirect-rules handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "redirect-rules", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to monitors handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "monitors", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to nginx-templates handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "nginx-templates", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to recipes handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "recipes", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to deployments handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "deployments", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should handle delete via forge_write tool", async () => {
    const result = await executeToolWithCredentials(
      "forge_write",
      { resource: "servers", action: "delete", id: "999" },
      creds,
    );
    // The mock delete returns undefined which is fine for delete operations
    expect(result.isError).toBeUndefined();
  });

  it("should reject write action on forge (read) tool", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "delete", id: "999" },
      creds,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("write operation");
    expect(result.content[0]!.text).toContain("forge_write");
  });

  it("should reject read action on forge_write tool", async () => {
    const result = await executeToolWithCredentials(
      "forge_write",
      { resource: "servers", action: "list" },
      creds,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("read operation");
    expect(result.content[0]!.text).toContain('"forge" tool');
  });

  it("should handle create via forge_write tool", async () => {
    const result = await executeToolWithCredentials(
      "forge_write",
      {
        resource: "servers",
        action: "create",
        provider: "ocean2",
        name: "test",
        type: "app",
        region: "nyc1",
        credential_id: "1",
      },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should handle compact=false to return full data", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "list", compact: false },
      creds,
    );
    expect(result.isError).toBeUndefined();
    // With compact=false, should return JSON data (array), not text summary
    const parsed = JSON.parse(result.content[0]!.text);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("should default compact=true for list action", async () => {
    // list action without explicit compact → compact defaults to true → returns text summary
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "list" },
      creds,
    );
    expect(result.isError).toBeUndefined();
    // compact=true → result.text (plain string summary), not a JSON array
    const text = result.content[0]!.text;
    expect(typeof text).toBe("string");
    expect(text).toContain("web-1");
    // plain text summary is not a JSON array
    expect(text.trimStart()).not.toMatch(/^\[/);
  });

  it("should default compact=false for get action", async () => {
    // get action without explicit compact → compact defaults to false → returns full data object
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "get", id: "1" },
      creds,
    );
    expect(result.isError).toBeUndefined();
    // compact=false → result.data (JSON object), not a string summary
    const parsed = JSON.parse(result.content[0]!.text);
    expect(typeof parsed).toBe("object");
    expect(parsed).not.toBeNull();
    expect(Array.isArray(parsed)).toBe(false);
    expect(parsed.id).toBe(1);
  });

  it("should include contextual hints for get action on servers", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "get", id: "1" },
      creds,
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]!.text);
    // get action with no compact → includeHints=true → _hints injected
    expect(parsed._hints).toBeDefined();
    expect(parsed._hints.related_resources).toBeDefined();
  });

  it("should not include hints when compact=true for get action", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "get", id: "1", compact: true },
      creds,
    );
    expect(result.isError).toBeUndefined();
    // compact=true → text summary, no JSON with _hints
    const text = result.content[0]!.text;
    expect(text).toContain("Server: web-1");
    // text summary is not a JSON object with _hints
    expect(text).not.toContain("_hints");
  });

  it("should respect explicit compact=true for get action", async () => {
    // Explicit compact=true on a get action → returns text summary
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "get", id: "1", compact: true },
      creds,
    );
    expect(result.isError).toBeUndefined();
    // compact=true → plain text summary
    const text = result.content[0]!.text;
    expect(typeof text).toBe("string");
    expect(text).toContain("Server: web-1");
  });

  it("should respect explicit compact=false for list action", async () => {
    // Explicit compact=false on a list action → returns full data array
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "list", compact: false },
      creds,
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]!.text);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("should handle help overview when resource is empty string", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "", action: "help" },
      creds,
    );
    // resource is falsy, so it should hit the missing resource error first
    expect(result.isError).toBe(true);
  });

  it("should handle schema overview when resource is servers", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "servers", action: "schema" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to backups handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "backups", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to commands handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "commands", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to scheduled-jobs handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "scheduled-jobs", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should route to user handler", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "user", action: "help" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should execute batch operations end-to-end", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      {
        resource: "batch",
        action: "run",
        operations: [
          { resource: "servers", action: "list" },
          { resource: "sites", action: "list", server_id: "1" },
        ],
      },
      creds,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data._batch.total).toBe(2);
    expect(data._batch.succeeded).toBe(2);
    expect(data._batch.failed).toBe(0);
  });
});
