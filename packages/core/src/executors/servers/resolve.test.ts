import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { resolveServers } from "./resolve.ts";

function createCtx() {
  return createTestExecutorContext({
    client: {
      get: async () =>
        mockListDocument("servers", [
          {
            id: 1,
            attributes: {
              id: 1,
              credential_id: null,
              name: "prod-web-1",
              type: "app",
              ubuntu_version: "22.04",
              ssh_port: 22,
              provider: "ocean2",
              identifier: null,
              size: "01",
              region: "ams3",
              php_version: "php83",
              php_cli_version: "php83",
              opcache_status: null,
              database_type: null,
              db_status: null,
              redis_status: null,
              ip_address: "1.2.3.4",
              private_ip_address: null,
              revoked: false,
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:00:00.000000Z",
              connection_status: "connected",
              timezone: "UTC",
              local_public_key: null,
              is_ready: true,
            },
          },
          {
            id: 2,
            attributes: {
              id: 2,
              credential_id: null,
              name: "prod-web-2",
              type: "app",
              ubuntu_version: "22.04",
              ssh_port: 22,
              provider: "ocean2",
              identifier: null,
              size: "01",
              region: "ams3",
              php_version: "php83",
              php_cli_version: "php83",
              opcache_status: null,
              database_type: null,
              db_status: null,
              redis_status: null,
              ip_address: "5.6.7.8",
              private_ip_address: null,
              revoked: false,
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:00:00.000000Z",
              connection_status: "connected",
              timezone: "UTC",
              local_public_key: null,
              is_ready: true,
            },
          },
          {
            id: 3,
            attributes: {
              id: 3,
              credential_id: null,
              name: "staging-web-1",
              type: "app",
              ubuntu_version: "22.04",
              ssh_port: 22,
              provider: "ocean2",
              identifier: null,
              size: "01",
              region: "ams3",
              php_version: "php83",
              php_cli_version: "php83",
              opcache_status: null,
              database_type: null,
              db_status: null,
              redis_status: null,
              ip_address: "9.10.11.12",
              private_ip_address: null,
              revoked: false,
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:00:00.000000Z",
              connection_status: "connected",
              timezone: "UTC",
              local_public_key: null,
              is_ready: true,
            },
          },
        ]),
    } as never,
    organizationSlug: "test-org",
  });
}

describe("resolveServers", () => {
  it("should return partial matches", async () => {
    const result = await resolveServers({ query: "prod" }, createCtx());
    expect(result.data.query).toBe("prod");
    expect(result.data.total).toBe(2);
    expect(result.data.matches).toHaveLength(2);
    expect(result.data.matches[0]!.name).toBe("prod-web-1");
    expect(result.data.matches[1]!.name).toBe("prod-web-2");
  });

  it("should return exact match as single result", async () => {
    const result = await resolveServers({ query: "prod-web-1" }, createCtx());
    expect(result.data.total).toBe(1);
    expect(result.data.matches).toHaveLength(1);
    expect(result.data.matches[0]!.id).toBe(1);
    expect(result.data.matches[0]!.name).toBe("prod-web-1");
  });

  it("should return empty for no matches", async () => {
    const result = await resolveServers({ query: "nonexistent" }, createCtx());
    expect(result.data.total).toBe(0);
    expect(result.data.matches).toHaveLength(0);
  });

  it("should be case insensitive", async () => {
    const result = await resolveServers({ query: "PROD" }, createCtx());
    expect(result.data.total).toBe(2);
    expect(result.data.matches[0]!.name).toBe("prod-web-1");
  });

  it("should return partial matches when multiple exact-like names exist", async () => {
    const attrs = {
      id: 1,
      credential_id: null,
      name: "prod-web-1",
      type: "app",
      ubuntu_version: "22.04",
      ssh_port: 22,
      provider: "ocean2",
      identifier: null,
      size: "01",
      region: "ams3",
      php_version: "php83",
      php_cli_version: "php83",
      opcache_status: null,
      database_type: null,
      db_status: null,
      redis_status: null,
      ip_address: "1.2.3.4",
      private_ip_address: null,
      revoked: false,
      created_at: "2024-01-01T00:00:00.000000Z",
      updated_at: "2024-01-01T00:00:00.000000Z",
      connection_status: "connected",
      timezone: "UTC",
      local_public_key: null,
      is_ready: true,
    };

    const ctxWithDupes = createTestExecutorContext({
      client: {
        get: async () =>
          mockListDocument("servers", [
            { id: 1, attributes: { ...attrs, id: 1 } },
            { id: 2, attributes: { ...attrs, id: 2 } },
          ]),
      } as never,
      organizationSlug: "test-org",
    });
    // Two exact matches → fall through to partial match
    const result = await resolveServers({ query: "prod-web-1" }, ctxWithDupes);
    expect(result.data.total).toBe(2);
    expect(result.data.matches).toHaveLength(2);
  });
});
