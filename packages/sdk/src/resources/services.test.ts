import { describe, expect, it } from "vitest";

import { HttpClient } from "@studiometa/forge-api";

import { toUrlString } from "../test-utils.ts";

import { ServicesCollection } from "./services.ts";

const ORG = "test-org";

const serverAttrs = {
  id: 123,
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
};

function createTrackingClient(overrides: Record<string, unknown> = {}): {
  client: HttpClient;
  calls: Array<{ method: string; url: string; body?: unknown }>;
} {
  const calls: Array<{ method: string; url: string; body?: unknown }> = [];

  const client = new HttpClient({
    token: "test",
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = toUrlString(url);
      calls.push({
        method: init?.method ?? "GET",
        url: urlStr,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          data: { id: "123", type: "servers", attributes: { ...serverAttrs, ...overrides } },
        }),
        text: async () => "{}",
      } as Response;
    },
  });

  return { client, calls };
}

describe("ServicesCollection", () => {
  it("should derive service availability from the server object", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ServicesCollection(client, ORG, 123);

    const services = await collection.list();

    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123`);
    expect(services).toEqual([
      { service: "nginx", available: true, detail: null },
      { service: "php", available: true, detail: "php83" },
      { service: "mysql", available: true, detail: "mysql8" },
      { service: "postgres", available: false, detail: null },
      { service: "redis", available: true, detail: "installed" },
      { service: "supervisor", available: true, detail: null },
    ]);
  });

  it("should derive postgres availability", async () => {
    const { client } = createTrackingClient({
      database_type: "postgres15",
      redis_status: null,
      php_version: null,
    });
    const collection = new ServicesCollection(client, ORG, 123);

    const services = await collection.list();
    const byName = Object.fromEntries(services.map((s) => [s.service, s]));

    expect(byName.postgres).toEqual({ service: "postgres", available: true, detail: "postgres15" });
    expect(byName.mysql.available).toBe(false);
    expect(byName.php.available).toBe(false);
    expect(byName.redis.available).toBe(false);
  });

  it("should restart a service via the reboot action", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ServicesCollection(client, ORG, 123);

    await collection.restart("nginx");

    expect(calls[0].method).toBe("POST");
    expect(calls[0].url).toContain(`/orgs/${ORG}/servers/123/services/nginx/actions`);
    expect(calls[0].body).toEqual({ action: "reboot" });
  });

  it("should include the version when restarting php", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ServicesCollection(client, ORG, 123);

    await collection.restart("php", { version: "php83" });

    expect(calls[0].body).toEqual({ action: "reboot", version: "php83" });
  });

  it("should throw for an invalid service", async () => {
    const { client } = createTrackingClient();
    const collection = new ServicesCollection(client, ORG, 123);

    await expect(collection.restart("apache")).rejects.toThrow(/Invalid service "apache"/);
  });

  it("should throw when restarting php without a version", async () => {
    const { client, calls } = createTrackingClient();
    const collection = new ServicesCollection(client, ORG, 123);

    await expect(collection.restart("php")).rejects.toThrow(/"php" service requires a version/);
    expect(calls).toHaveLength(0);
  });
});
