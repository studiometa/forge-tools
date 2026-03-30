import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";
import { handleServerContext, handleSiteContext } from "./context.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          // Server sub-resources
          if (url.match(/\/orgs\/test-org\/servers\/\d+\/sites$/))
            return mockListDocument("sites", [
              {
                id: 1,
                attributes: {
                  name: "app.com",
                  aliases: [],
                  root_directory: null,
                  web_directory: "/public",
                  wildcards: null,
                  status: "installed",
                  repository: null,
                  quick_deploy: null,
                  deployment_status: null,
                  deployment_url: "",
                  deployment_script: null,
                  php_version: "php84",
                  app_type: "php",
                  url: "",
                  https: false,
                  isolated: false,
                  user: "forge",
                  database: null,
                  shared_paths: null,
                  uses_envoyer: false,
                  zero_downtime_deployments: false,
                  maintenance_mode: null,
                  healthcheck_url: null,
                  created_at: "2024-01-01",
                  updated_at: "2024-01-01",
                } as never,
              },
            ]);
          if (url.match(/\/orgs\/test-org\/servers\/\d+\/database\/schemas$/))
            return mockListDocument("databases", [
              {
                id: 1,
                attributes: {
                  name: "mydb",
                  status: "installed",
                  created_at: "2024-01-01",
                  updated_at: "2024-01-01",
                },
              },
            ]);
          if (url.match(/\/orgs\/test-org\/servers\/\d+\/database\/users$/))
            return mockListDocument("database-users", [
              {
                id: 1,
                attributes: {
                  name: "forge",
                  status: "installed",
                  created_at: "2024-01-01",
                  updated_at: "2024-01-01",
                },
              },
            ]);
          if (url.match(/\/orgs\/test-org\/servers\/\d+\/background-processes$/))
            return mockListDocument("background-processes", []);
          if (url.match(/\/orgs\/test-org\/servers\/\d+\/firewall-rules$/))
            return mockListDocument("firewall-rules", []);
          if (url.match(/\/orgs\/test-org\/servers\/\d+\/scheduled-jobs$/))
            return mockListDocument("scheduled-jobs", []);
          // Site sub-resources (must come before server get)
          if (url.match(/\/orgs\/test-org\/servers\/\d+\/sites\/\d+\/deployments/)) {
            return mockListDocument(
              "deployments",
              Array.from({ length: 8 }, (_, i) => ({
                id: i + 1,
                attributes: {
                  commit: { hash: "abc", author: null, message: null, branch: null },
                  status: "finished",
                  type: "push",
                  started_at: "2024-01-01",
                  ended_at: null,
                  created_at: "2024-01-01",
                  updated_at: "2024-01-01",
                } as never,
              })),
            );
          }
          if (url.match(/\/orgs\/test-org\/servers\/\d+\/sites\/\d+\/redirect-rules$/))
            return mockListDocument("redirect-rules", []);
          if (url.match(/\/orgs\/test-org\/servers\/\d+\/sites\/\d+\/security-rules$/))
            return mockListDocument("security-rules", []);
          // Site get (must come before server get)
          if (url.match(/\/orgs\/test-org\/sites\/\d+$/))
            return mockDocument(1, "sites", {
              name: "app.com",
              aliases: [],
              root_directory: null,
              web_directory: "/public",
              wildcards: null,
              status: "installed",
              repository: null,
              quick_deploy: null,
              deployment_status: null,
              deployment_url: "",
              deployment_script: null,
              php_version: "php84",
              app_type: "php",
              url: "",
              https: false,
              isolated: false,
              user: "forge",
              database: null,
              shared_paths: null,
              uses_envoyer: false,
              zero_downtime_deployments: false,
              maintenance_mode: null,
              healthcheck_url: null,
              created_at: "2024-01-01",
              updated_at: "2024-01-01",
            } as never);
          // Server get
          if (url.match(/\/orgs\/test-org\/servers\/\d+$/))
            return mockDocument(1, "servers", {
              id: 1,
              name: "web-1",
              is_ready: true,
              credential_id: null,
              type: "app",
              ubuntu_version: null,
              ssh_port: 22,
              provider: "ocean2",
              identifier: null,
              size: "01",
              region: "ams3",
              php_version: null,
              php_cli_version: null,
              opcache_status: null,
              database_type: null,
              db_status: null,
              redis_status: null,
              ip_address: "1.2.3.4",
              private_ip_address: null,
              revoked: false,
              created_at: "2024-01-01",
              updated_at: "2024-01-01",
              connection_status: "connected",
              timezone: "UTC",
              local_public_key: null,
            });
          return {};
        },
      } as never,
    },
    compact: false,
  };
}

describe("handleServerContext", () => {
  it("returns server plus all sub-resources", async () => {
    const result = await handleServerContext(
      { resource: "servers", action: "context", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.server).toBeDefined();
    expect(data.server.name).toBe("web-1");
    expect(data.sites).toBeDefined();
    expect(Array.isArray(data.sites)).toBe(true);
    expect(data.databases).toBeDefined();
    expect(data.database_users).toBeDefined();
    expect(data.daemons).toBeDefined();
    expect(data.firewall_rules).toBeDefined();
    expect(data.scheduled_jobs).toBeDefined();
  });

  it("returns error when id is missing", async () => {
    const result = await handleServerContext(
      { resource: "servers", action: "context" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("id");
  });

  it("includes structured content on success", async () => {
    const result = await handleServerContext(
      { resource: "servers", action: "context", id: "42" },
      createMockContext(),
    );
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent?.success).toBe(true);
  });
});

describe("handleSiteContext", () => {
  it("returns site plus all sub-resources", async () => {
    const result = await handleSiteContext(
      { resource: "sites", action: "context", server_id: "1", id: "2" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.site).toBeDefined();
    expect(data.site.name).toBe("app.com");
    expect(data.deployments).toBeDefined();
    expect(data.redirect_rules).toBeDefined();
    expect(data.security_rules).toBeDefined();
  });

  it("limits deployments to last 5", async () => {
    const result = await handleSiteContext(
      { resource: "sites", action: "context", server_id: "1", id: "2" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.deployments).toHaveLength(5);
  });

  it("returns error when server_id is missing", async () => {
    const result = await handleSiteContext(
      { resource: "sites", action: "context", id: "2" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("server_id");
  });

  it("returns error when id is missing", async () => {
    const result = await handleSiteContext(
      { resource: "sites", action: "context", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("id");
  });

  it("includes structured content on success", async () => {
    const result = await handleSiteContext(
      { resource: "sites", action: "context", server_id: "1", id: "2" },
      createMockContext(),
    );
    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent?.success).toBe(true);
  });

  it("handles empty deployments list gracefully", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        organizationSlug: "test-org",
        client: {
          get: async (url: string) => {
            if (url.match(/\/sites\/\d+\/deployments/)) return mockListDocument("deployments", []);
            if (url.match(/\/sites\/\d+\/redirect-rules$/))
              return mockListDocument("redirect-rules", []);
            if (url.match(/\/sites\/\d+\/security-rules$/))
              return mockListDocument("security-rules", []);
            if (url.match(/\/sites\/\d+$/))
              return mockDocument(1, "sites", {
                name: "app.com",
                aliases: [],
                root_directory: null,
                web_directory: "/public",
                wildcards: null,
                status: "installed",
                repository: null,
                quick_deploy: null,
                deployment_status: null,
                deployment_url: "",
                deployment_script: null,
                php_version: "php84",
                app_type: "php",
                url: "",
                https: false,
                isolated: false,
                user: "forge",
                database: null,
                shared_paths: null,
                uses_envoyer: false,
                zero_downtime_deployments: false,
                maintenance_mode: null,
                healthcheck_url: null,
                created_at: null,
                updated_at: null,
              });
            return {};
          },
        } as never,
      },
      compact: false,
    };
    const result = await handleSiteContext(
      { resource: "sites", action: "context", server_id: "1", id: "2" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(Array.isArray(data.deployments)).toBe(true);
    expect(data.deployments).toHaveLength(0);
  });
});
