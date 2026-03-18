import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleServers } from "./servers.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          if (url.match(/\/servers\/\d+$/)) {
            return mockDocument(1, "servers", {
              id: 1,
              name: "web-1",
              provider: "ocean2",
              region: "ams3",
              ip_address: "1.2.3.4",
              is_ready: true,
              created_at: "2024-01-01",
              updated_at: "2024-01-01",
              php_version: "php83",
              ubuntu_version: "22.04",
              credential_id: null,
              type: "app",
              identifier: null,
              size: "01",
              php_cli_version: null,
              opcache_status: null,
              database_type: null,
              db_status: null,
              redis_status: null,
              private_ip_address: null,
              local_public_key: null,
              revoked: false,
              connection_status: "connected",
              timezone: "UTC",
              ssh_port: 22,
            });
          }
          return mockListDocument("servers", []);
        },
        post: async () =>
          mockDocument(1, "servers", {
            id: 1,
            name: "web-1",
            provider: "ocean2",
            region: "ams3",
            ip_address: null,
            is_ready: false,
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
            php_version: null,
            ubuntu_version: null,
            credential_id: null,
            type: "app",
            identifier: null,
            size: "01",
            php_cli_version: null,
            opcache_status: null,
            database_type: null,
            db_status: null,
            redis_status: null,
            private_ip_address: null,
            local_public_key: null,
            revoked: false,
            connection_status: "connecting",
            timezone: "UTC",
            ssh_port: 22,
          }),
        delete: async () => undefined,
      } as never,
    },
    compact: true,
  };
}

describe("handleServers", () => {
  it("should list servers", async () => {
    const result = await handleServers(
      "list",
      { resource: "servers", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
  });

  it("should get a server", async () => {
    const result = await handleServers(
      "get",
      { resource: "servers", action: "get", id: "123" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("web-1");
  });

  it("should require id for get", async () => {
    const result = await handleServers(
      "get",
      { resource: "servers", action: "get" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("id");
  });

  it("should reboot a server", async () => {
    const result = await handleServers(
      "reboot",
      { resource: "servers", action: "reboot", id: "123" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("reboot");
  });

  it("should handle unknown action", async () => {
    const result = await handleServers(
      "unknown",
      { resource: "servers", action: "unknown" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });

  it("should reject path traversal in id", async () => {
    const result = await handleServers(
      "get",
      { resource: "servers", action: "get", id: "../etc/passwd" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Invalid");
  });

  it("should create a server", async () => {
    const result = await handleServers(
      "create",
      {
        resource: "servers",
        action: "create",
        provider: "ocean2",
        credential_id: "1",
        name: "web-new",
        type: "app",
        size: "01",
        region: "ams3",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
  });

  it("should delete a server", async () => {
    const result = await handleServers(
      "delete",
      { resource: "servers", action: "delete", id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
  });

  it("should create a server with defaults for credential_id and size", async () => {
    const result = await handleServers(
      "create",
      {
        resource: "servers",
        action: "create",
        provider: "hetzner",
        name: "web-1",
        type: "app",
        region: "eu",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
  });

  it("should inject hints on get when includeHints=true", async () => {
    const ctx = createMockContext();
    ctx.compact = false;
    ctx.includeHints = true;

    const result = await handleServers("get", { resource: "servers", action: "get", id: "1" }, ctx);
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
            if (url.match(/\/orgs\/test-org\/servers\/\d+\/sites$/))
              return mockListDocument("sites", []);
            if (url.match(/\/orgs\/test-org\/servers\/\d+\/database\/schemas$/))
              return mockListDocument("databases", []);
            if (url.match(/\/orgs\/test-org\/servers\/\d+\/database\/users$/))
              return mockListDocument("database-users", []);
            if (url.match(/\/orgs\/test-org\/servers\/\d+\/background-processes$/))
              return mockListDocument("background-processes", []);
            if (url.match(/\/orgs\/test-org\/servers\/\d+\/firewall-rules$/))
              return mockListDocument("firewall-rules", []);
            if (url.match(/\/orgs\/test-org\/servers\/\d+\/scheduled-jobs$/))
              return mockListDocument("scheduled-jobs", []);
            if (url.match(/\/orgs\/test-org\/servers\/\d+$/))
              return mockDocument(1, "servers", {
                id: 1,
                name: "web-1",
                is_ready: true,
                provider: "ocean2",
                region: "ams3",
                ip_address: "1.2.3.4",
                created_at: "2024-01-01",
                updated_at: "2024-01-01",
                credential_id: null,
                type: "app",
                identifier: null,
                size: "01",
                ubuntu_version: null,
                php_version: null,
                php_cli_version: null,
                opcache_status: null,
                database_type: null,
                db_status: null,
                redis_status: null,
                private_ip_address: null,
                local_public_key: null,
                revoked: false,
                connection_status: "connected",
                timezone: "UTC",
                ssh_port: 22,
              });
            return {};
          },
        } as never,
      },
      compact: false,
    };
    const result = await handleServers(
      "context",
      { resource: "servers", action: "context", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    const data = JSON.parse(result.content[0]!.text);
    expect(data.server).toBeDefined();
    expect(data.sites).toBeDefined();
    expect(data.databases).toBeDefined();
  });

  it("should resolve servers by name (partial match)", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        organizationSlug: "test-org",
        client: {
          get: async () =>
            mockListDocument("servers", [
              { id: 1, attributes: { id: 1, name: "prod-web-1" } as never },
              { id: 2, attributes: { id: 2, name: "prod-web-2" } as never },
              { id: 3, attributes: { id: 3, name: "staging-web-1" } as never },
            ]),
        } as never,
      },
      compact: true,
    };
    const result = await handleServers(
      "resolve",
      { resource: "servers", action: "resolve", query: "prod" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("prod-web-1");
    expect(result.content[0]!.text).toContain("prod-web-2");
    expect(result.content[0]!.text).toContain("2 server(s)");
  });

  it("should resolve servers — no matches", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        organizationSlug: "test-org",
        client: {
          get: async () =>
            mockListDocument("servers", [
              { id: 1, attributes: { id: 1, name: "staging-web-1" } as never },
            ]),
        } as never,
      },
      compact: true,
    };
    const result = await handleServers(
      "resolve",
      { resource: "servers", action: "resolve", query: "prod" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain('No servers matching "prod"');
  });

  it("should require query for resolve", async () => {
    const result = await handleServers(
      "resolve",
      { resource: "servers", action: "resolve" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("query");
  });
});
