import type { ServerAttributes } from "@studiometa/forge-api";
import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { mockDocument } from "../../test-helpers.ts";
import { listServices } from "./list.ts";

function makeServer(overrides: Partial<ServerAttributes> = {}): ServerAttributes {
  return {
    id: 1,
    credential_id: 1,
    name: "web-1",
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
    database_type: "mysql8",
    db_status: null,
    redis_status: "installed",
    ip_address: "1.2.3.4",
    private_ip_address: null,
    revoked: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    connection_status: "connected",
    timezone: "UTC",
    local_public_key: null,
    is_ready: true,
    ...overrides,
  };
}

function contextForServer(server: ServerAttributes) {
  const getMock = vi.fn(async () => mockDocument(server.id, "servers", server));
  const ctx = createTestExecutorContext({
    client: { get: getMock } as never,
    organizationSlug: "test-org",
  });
  return { ctx, getMock };
}

describe("listServices", () => {
  it("should derive availability for a mysql + redis + php server", async () => {
    const { ctx, getMock } = contextForServer(makeServer());

    const result = await listServices({ server_id: "1" }, ctx);

    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/1");
    expect(result.data).toEqual([
      { service: "nginx", available: true, detail: null },
      { service: "php", available: true, detail: "php83" },
      { service: "mysql", available: true, detail: "mysql8" },
      { service: "postgres", available: false, detail: null },
      { service: "redis", available: true, detail: "installed" },
      { service: "supervisor", available: true, detail: null },
    ]);
  });

  it("should mark postgres available and mysql unavailable for a postgres server", async () => {
    const { ctx } = contextForServer(
      makeServer({ database_type: "postgres15", redis_status: null, php_version: null }),
    );

    const result = await listServices({ server_id: "1" }, ctx);
    const byName = Object.fromEntries(result.data.map((r) => [r.service, r]));

    expect(byName.php).toEqual({ service: "php", available: false, detail: null });
    expect(byName.mysql).toEqual({ service: "mysql", available: false, detail: null });
    expect(byName.postgres).toEqual({
      service: "postgres",
      available: true,
      detail: "postgres15",
    });
    expect(byName.redis).toEqual({ service: "redis", available: false, detail: null });
  });

  it("should treat mariadb as mysql", async () => {
    const { ctx } = contextForServer(makeServer({ database_type: "mariadb106" }));

    const result = await listServices({ server_id: "1" }, ctx);
    const mysql = result.data.find((r) => r.service === "mysql");

    expect(mysql).toEqual({ service: "mysql", available: true, detail: "mariadb106" });
  });

  it("should handle a server with no database type", async () => {
    const { ctx } = contextForServer(makeServer({ database_type: null }));

    const result = await listServices({ server_id: "1" }, ctx);
    const byName = Object.fromEntries(result.data.map((r) => [r.service, r]));

    expect(byName.mysql.available).toBe(false);
    expect(byName.postgres.available).toBe(false);
  });
});
