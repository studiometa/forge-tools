import { describe, expect, it, vi } from "vitest";

import { mockResource } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleNetwork } from "./network.ts";

const server = {
  id: 2,
  credential_id: null,
  name: "db-1",
  type: "database",
  ubuntu_version: "24.04",
  ssh_port: 22,
  provider: "hetzner",
  identifier: null,
  size: "cx22",
  region: "fsn1",
  php_version: null,
  php_cli_version: null,
  opcache_status: null,
  database_type: null,
  db_status: null,
  redis_status: null,
  ip_address: "1.2.3.4",
  private_ip_address: "10.0.0.2",
  revoked: false,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  connection_status: "connected",
  timezone: "UTC",
  local_public_key: null,
  is_ready: true,
};

function context() {
  const get = vi.fn(async () => ({ data: [mockResource(2, "servers", server)] }));
  const put = vi.fn(async () => {});
  const ctx: HandlerContext = {
    executorContext: { organizationSlug: "o", client: { get, put } as never },
    compact: true,
  };
  return { ctx, get, put };
}

describe("handleNetwork", () => {
  it("should list the servers in the network", async () => {
    const { ctx, get } = context();
    const result = await handleNetwork(
      "get",
      { resource: "network", action: "get", server_id: "1" },
      ctx,
    );
    expect(get).toHaveBeenCalledWith("/orgs/o/servers/1/network");
    expect(result.content[0].text).toContain("db-1 (ID: 2)");
  });

  it("should set the network", async () => {
    const { ctx, put } = context();
    const result = await handleNetwork(
      "update",
      { resource: "network", action: "update", server_id: "1", servers: [2, 3] },
      ctx,
    );
    expect(put).toHaveBeenCalledWith("/orgs/o/servers/1/network", { servers: [2, 3] });
    expect(result.content[0].text).toBe("Network of server 1 updated.");
  });

  it("should require servers to update", async () => {
    const { ctx } = context();
    const result = await handleNetwork(
      "update",
      { resource: "network", action: "update", server_id: "1" },
      ctx,
    );
    expect(result.isError).toBe(true);
  });
});
