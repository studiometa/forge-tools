import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createServer } from "./create.ts";

describe("createServer", () => {
  it("should create a server and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(99, "servers", {
            id: 99,
            credential_id: 1,
            name: "web-new",
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
            ip_address: null,
            private_ip_address: null,
            revoked: false,
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
            connection_status: "connecting",
            timezone: "UTC",
            local_public_key: null,
            is_ready: false,
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createServer(
      {
        provider: "ocean2",
        credential_id: 1,
        name: "web-new",
        type: "app",
        size: "01",
        region: "ams3",
      },
      ctx,
    );

    expect(result.data.name).toBe("web-new");
  });

  it("should show ready status when server is ready", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(100, "servers", {
            id: 100,
            credential_id: 1,
            name: "web-ready",
            type: "app",
            ubuntu_version: "22.04",
            ssh_port: 22,
            provider: "hetzner",
            identifier: null,
            size: "01",
            region: "eu",
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
          }),
      } as never,
      organizationSlug: "test-org",
    });

    await createServer(
      {
        provider: "hetzner",
        credential_id: 1,
        name: "web-ready",
        type: "app",
        size: "01",
        region: "eu",
      },
      ctx,
    );
  });
});
