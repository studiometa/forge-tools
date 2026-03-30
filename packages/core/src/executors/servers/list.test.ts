import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listServers } from "./list.ts";

describe("listServers", () => {
  it("should list servers and format output", async () => {
    const getMock = async () =>
      mockListDocument("servers", [
        {
          id: 1,
          attributes: {
            id: 1,
            credential_id: 1,
            name: "web-1",
            type: "app",
            ubuntu_version: "22.04",
            ssh_port: 22,
            provider: "ocean2",
            identifier: "123",
            size: "01",
            region: "ams3",
            php_version: "php83",
            php_cli_version: "php83",
            opcache_status: null,
            database_type: "mysql8",
            db_status: null,
            redis_status: null,
            ip_address: "1.2.3.4",
            private_ip_address: "10.0.0.1",
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
            credential_id: 1,
            name: "web-2",
            type: "app",
            ubuntu_version: "22.04",
            ssh_port: 22,
            provider: "ocean2",
            identifier: "456",
            size: "01",
            region: "ams3",
            php_version: "php83",
            php_cli_version: "php83",
            opcache_status: null,
            database_type: "mysql8",
            db_status: null,
            redis_status: null,
            ip_address: "5.6.7.8",
            private_ip_address: "10.0.0.2",
            revoked: false,
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
            connection_status: "connected",
            timezone: "UTC",
            local_public_key: null,
            is_ready: false,
          },
        },
      ]);

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listServers({} as Record<string, never>, ctx);

    expect(result.data).toHaveLength(2);
  });

  it("should handle empty server list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => mockListDocument("servers", []),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await listServers({} as Record<string, never>, ctx);

    expect(result.data).toHaveLength(0);
  });
});
