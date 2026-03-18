import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getServer } from "./get.ts";

describe("getServer", () => {
  it("should get a server and format output", async () => {
    const getMock = async () =>
      mockDocument(123, "servers", {
        id: 123,
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
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getServer({ server_id: "123" }, ctx);

    expect(result.data.name).toBe("web-1");
  });

  it("should show provisioning status", async () => {
    const getMock = async () =>
      mockDocument(124, "servers", {
        id: 124,
        credential_id: 1,
        name: "web-2",
        type: "app",
        ubuntu_version: "24.04",
        ssh_port: 22,
        provider: "hetzner",
        identifier: null,
        size: "01",
        region: "eu",
        php_version: "php84",
        php_cli_version: "php84",
        opcache_status: null,
        database_type: null,
        db_status: null,
        redis_status: null,
        ip_address: "5.6.7.8",
        private_ip_address: null,
        revoked: false,
        created_at: "2024-02-01T00:00:00.000000Z",
        updated_at: "2024-02-01T00:00:00.000000Z",
        connection_status: "connecting",
        timezone: "UTC",
        local_public_key: null,
        is_ready: false,
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    await getServer({ server_id: "124" }, ctx);
  });
});
