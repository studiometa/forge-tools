import { describe, expect, it } from "vitest";

import type { ForgeServer, ServersResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listServers } from "./list.ts";

function createMockServer(overrides: Partial<ForgeServer> = {}): ForgeServer {
  return {
    id: 1,
    credential_id: 1,
    name: "web-1",
    type: "app",
    provider: "ocean2",
    provider_id: "123",
    size: "01",
    region: "ams3",
    ubuntu_version: "22.04",
    db_status: null,
    redis_status: null,
    php_version: "php83",
    php_cli_version: "php83",
    database_type: "mysql8",
    ip_address: "1.2.3.4",
    ssh_port: 22,
    private_ip_address: "10.0.0.1",
    local_public_key: "ssh-rsa ...",
    is_ready: true,
    revoked: false,
    created_at: "2024-01-01T00:00:00.000000Z",
    network: [],
    tags: [],
    ...overrides,
  };
}

describe("listServers", () => {
  it("should list servers and format output", async () => {
    const servers = [
      createMockServer({ id: 1, name: "web-1", is_ready: true }),
      createMockServer({ id: 2, name: "web-2", is_ready: false }),
    ];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ servers }) as ServersResponse,
      } as never,
    });

    const result = await listServers({} as Record<string, never>, ctx);

    expect(result.data).toHaveLength(2);
  });

  it("should handle empty server list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ servers: [] }) as ServersResponse,
      } as never,
    });

    const result = await listServers({} as Record<string, never>, ctx);

    expect(result.data).toHaveLength(0);
  });
});
