import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { updateServer } from "./update.ts";

describe("updateServer", () => {
  it("should send the changed fields and return the server", async () => {
    const putMock = vi.fn(async () =>
      mockDocument(123, "servers", {
        id: 123,
        credential_id: 1,
        name: "web-2",
        type: "app",
        ubuntu_version: "24.04",
        ssh_port: 22,
        provider: "ocean2",
        identifier: "123",
        size: "01",
        region: "ams3",
        php_version: "php84",
        php_cli_version: "php84",
        opcache_status: null,
        database_type: null,
        db_status: null,
        redis_status: null,
        ip_address: "1.2.3.4",
        private_ip_address: "10.0.0.1",
        revoked: false,
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
        connection_status: "connected",
        timezone: "Europe/Paris",
        local_public_key: null,
        is_ready: true,
        slug: "web-2",
      }),
    );
    const ctx = createTestExecutorContext({
      client: { put: putMock } as never,
      organizationSlug: "test-org",
    });

    const result = await updateServer(
      { server_id: "123", name: "web-2", timezone: "Europe/Paris" },
      ctx,
    );

    expect(putMock).toHaveBeenCalledWith("/orgs/test-org/servers/123", {
      name: "web-2",
      timezone: "Europe/Paris",
    });
    expect(result.data).toMatchObject({ id: 123, name: "web-2", slug: "web-2" });
  });
});
