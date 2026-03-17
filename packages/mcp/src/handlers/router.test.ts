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
        // Return minimal JSON:API shapes per resource
        // Backups
        if (path.includes("/database/backups"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Commands (site-level)
        if (path.includes("/commands"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Database users
        if (path.includes("/database/users"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Daemons
        if (path.includes("/background-processes"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Firewall rules
        if (path.includes("/firewall-rules"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Certificates
        if (path.includes("/certificates"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Monitors
        if (path.includes("/monitors"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Nginx templates
        if (path.includes("/nginx/templates"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Redirect rules
        if (path.includes("/redirect-rules"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Scheduled jobs
        if (path.includes("/scheduled-jobs"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Security rules
        if (path.includes("/security-rules"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // SSH keys
        if (path.includes("/ssh-keys"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Recipes
        if (path.includes("/recipes"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Database schemas
        if (path.includes("/database/schemas"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Sites (must come before deployments check)
        if (path.includes("/sites") && !path.includes("/deployments"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Deployments
        if (path.includes("/deployments"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        // Servers (generic)
        if (path.includes("/servers"))
          return {
            data: [],
            links: { next: null, prev: null },
            meta: { per_page: 30, next_cursor: null, prev_cursor: null },
          };
        if (path === "/user")
          return {
            data: {
              id: "1",
              type: "users",
              attributes: {
                name: "Test",
                email: "t@t.com",
                two_factor_enabled: false,
                two_factor_confirmed: false,
                github_connected: false,
                gitlab_connected: false,
                bitbucket_connected: false,
                do_connected: false,
                timezone: "UTC",
                created_at: "2024-01-01",
                updated_at: "2024-01-01",
              },
              links: { self: { href: "/user/1" } },
            },
          };
        if (path.match(/\/sites\/\d+\/environment$/))
          return {
            data: {
              id: "1",
              type: "environments",
              attributes: { content: "" },
              links: { self: { href: "/env/1" } },
            },
          };
        if (path.match(/\/sites\/\d+\/nginx$/)) return "";
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

const creds = { apiToken: "test-token", organizationSlug: "test-org" };

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
