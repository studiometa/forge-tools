import { describe, expect, it, vi } from "vitest";

import { mockResource } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getServerNetwork } from "./get-network.ts";
import { updateServerNetwork } from "./update-network.ts";

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
  database_type: "mysql8",
  db_status: null,
  redis_status: null,
  ip_address: "1.2.3.4",
  private_ip_address: "10.0.0.2",
  revoked: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  connection_status: "connected",
  timezone: "UTC",
  local_public_key: null,
  is_ready: true,
};

describe("getServerNetwork", () => {
  it("should list the servers in the network of a server", async () => {
    const get = vi.fn(async () => ({ data: [mockResource(2, "servers", server)] }));
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "o" });

    const result = await getServerNetwork({ server_id: "1" }, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/o/servers/1/network");
    expect(result.data).toEqual([server]);
  });
});

describe("updateServerNetwork", () => {
  it("should send the server IDs of the network", async () => {
    const put = vi.fn(async () => {});
    const ctx = createTestExecutorContext({ client: { put } as never, organizationSlug: "o" });

    const result = await updateServerNetwork({ server_id: "1", servers: [2, 3] }, ctx);

    expect(put).toHaveBeenCalledWith("/orgs/o/servers/1/network", { servers: [2, 3] });
    expect(result.data).toBeUndefined();
  });
});
