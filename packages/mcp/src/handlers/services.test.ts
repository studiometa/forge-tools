import { describe, expect, it } from "vitest";

import { mockDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleServices } from "./services.ts";

function makeServerAttrs(overrides: Record<string, unknown> = {}) {
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

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async () => mockDocument(1, "servers", makeServerAttrs()),
        post: async () => {},
      } as never,
    },
    compact: true,
  };
}

describe("handleServices", () => {
  it("should list services derived from the server object", async () => {
    const result = await handleServices(
      "list",
      { resource: "services", action: "list", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("nginx");
    expect(result.content[0].text).toContain("php");
  });

  it("should restart a service", async () => {
    const result = await handleServices(
      "restart",
      { resource: "services", action: "restart", server_id: "1", service: "nginx" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("nginx restart initiated");
  });

  it("should restart php with a version", async () => {
    const result = await handleServices(
      "restart",
      {
        resource: "services",
        action: "restart",
        server_id: "1",
        service: "php",
        version: "php83",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("php restart initiated");
  });

  it("should reject an invalid service", async () => {
    // The core executor throws; executeToolWithCredentials catches it in the real
    // flow, so calling the handler directly surfaces the rejection.
    await expect(
      handleServices(
        "restart",
        { resource: "services", action: "restart", server_id: "1", service: "apache" },
        createMockContext(),
      ),
    ).rejects.toThrow(/Invalid service "apache"/);
  });

  it("should require server_id for list", async () => {
    const result = await handleServices(
      "list",
      { resource: "services", action: "list" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleServices(
      "unknown",
      { resource: "services", action: "unknown", server_id: "1" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown action");
  });
});
