/**
 * Tests for routeToHandler — ensures every resource case in the switch is covered.
 *
 * Each resource is exercised with a minimal list/get action via executeToolWithCredentials
 * using a mock HttpClient that returns the minimum expected response shape.
 */
import { describe, expect, it, vi } from "vitest";

import { executeToolWithCredentials } from "./index.ts";

vi.mock("@studiometa/forge-api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@studiometa/forge-api")>();
  return {
    ...mod,
    HttpClient: class MockHttpClient {
      async get(path: string) {
        // Return minimal shapes per resource
        // Backups
        if (path.includes("/backup-configs")) return { backups: [] };
        // Commands (site-level)
        if (path.includes("/commands")) return { commands: [] };
        // Database users
        if (path.includes("/database-users")) return { users: [] };
        // Daemons
        if (path.includes("/daemons")) return { daemons: [] };
        // Firewall rules
        if (path.includes("/firewall-rules")) return { rules: [] };
        // Certificates
        if (path.includes("/certificates")) return { certificates: [] };
        // Monitors
        if (path.includes("/monitors")) return { monitors: [] };
        // Nginx templates
        if (path.includes("/nginx/templates")) return { templates: [] };
        // Redirect rules
        if (path.includes("/redirect-rules")) return { redirect_rules: [] };
        // Scheduled jobs
        if (path.includes("/jobs")) return { jobs: [] };
        // Security rules
        if (path.includes("/security-rules")) return { security_rules: [] };
        // SSH keys
        if (path.includes("/keys")) return { keys: [] };
        // Recipes
        if (path.includes("/recipes")) return { recipes: [] };
        // Sites (must come before deployments check)
        if (path.includes("/sites") && !path.includes("/deployments")) return { sites: [] };
        // Deployments
        if (path.includes("/deployments")) return { deployments: [] };
        // Databases (must come before database-users check)
        if (path.includes("/databases") && !path.includes("-users")) return { databases: [] };
        // Servers (generic)
        if (path.startsWith("/servers") && path.split("/").length <= 3) return { servers: [] };
        if (path === "/user") return { user: { id: 1, name: "Test", email: "t@t.com" } };
        if (path.match(/\/servers\/\d+\/sites\/\d+\/env$/)) return "";
        if (path.match(/\/servers\/\d+\/sites\/\d+\/nginx$/)) return "";
        return {};
      }
      async post() {
        return {};
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

describe("routeToHandler — resource routing coverage", () => {
  const listCases: Array<{ resource: string; extra?: Record<string, unknown> }> = [
    { resource: "daemons", extra: { server_id: "1" } },
    { resource: "firewall-rules", extra: { server_id: "1" } },
    { resource: "ssh-keys", extra: { server_id: "1" } },
    { resource: "security-rules", extra: { server_id: "1", site_id: "10" } },
    { resource: "redirect-rules", extra: { server_id: "1", site_id: "10" } },
    { resource: "monitors", extra: { server_id: "1" } },
    { resource: "nginx-templates", extra: { server_id: "1" } },
    { resource: "recipes", extra: {} },
    { resource: "backups", extra: { server_id: "1" } },
    { resource: "commands", extra: { server_id: "1", site_id: "10" } },
    { resource: "scheduled-jobs", extra: { server_id: "1" } },
    { resource: "database-users", extra: { server_id: "1" } },
    { resource: "certificates", extra: { server_id: "1", site_id: "10" } },
    { resource: "deployments", extra: { server_id: "1", site_id: "10" } },
  ];

  for (const { resource, extra } of listCases) {
    it(`should route ${resource} list action without error`, async () => {
      const result = await executeToolWithCredentials(
        "forge",
        { resource, action: "list", ...extra },
        creds,
      );
      expect(result.isError).toBeUndefined();
    });
  }

  it("should route user get action", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "user", action: "get" },
      creds,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should return error for completely unknown resource (default branch)", async () => {
    const result = await executeToolWithCredentials(
      "forge",
      { resource: "nonexistent-resource", action: "list" },
      creds,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown resource");
  });

  it("should return error when resource and action are missing", async () => {
    const result = await executeToolWithCredentials("forge", {}, creds);
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Missing required fields");
  });
});
