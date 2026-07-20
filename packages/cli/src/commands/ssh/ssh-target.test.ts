import { describe, it, expect } from "vitest";

import type { ServerAttributes } from "@studiometa/forge-api";

import { ValidationError } from "../../errors.ts";
import { DEFAULT_SSH_USER, buildSshArgs, resolveSshTarget } from "./ssh-target.ts";

const baseServer: ServerAttributes = {
  id: 1,
  credential_id: 0,
  name: "my-server",
  type: "app",
  provider: "ocean2",
  identifier: null,
  size: "01",
  region: "nyc3",
  ubuntu_version: "22.04",
  db_status: null,
  redis_status: null,
  php_version: "php83",
  php_cli_version: "php83",
  database_type: "mysql8",
  ip_address: "1.2.3.4",
  ssh_port: 22,
  private_ip_address: "10.0.0.1",
  local_public_key: null,
  opcache_status: null,
  connection_status: "connected",
  timezone: "UTC",
  is_ready: true,
  revoked: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
} as ServerAttributes;

describe("resolveSshTarget", () => {
  it("defaults to the forge user, public IP and server ssh port", () => {
    expect(resolveSshTarget(baseServer)).toEqual({
      user: DEFAULT_SSH_USER,
      host: "1.2.3.4",
      port: 22,
    });
  });

  it("honors a custom user (trimmed)", () => {
    expect(resolveSshTarget(baseServer, { user: "  deploy  " }).user).toBe("deploy");
  });

  it("falls back to the default user when the override is blank", () => {
    expect(resolveSshTarget(baseServer, { user: "   " }).user).toBe(DEFAULT_SSH_USER);
  });

  it("uses the private IP with --private", () => {
    expect(resolveSshTarget(baseServer, { private: true }).host).toBe("10.0.0.1");
  });

  it("overrides the port when a valid one is given", () => {
    expect(resolveSshTarget(baseServer, { port: "2222" }).port).toBe(2222);
  });

  it("throws when the public IP is not available (provisioning)", () => {
    const server = { ...baseServer, ip_address: null, is_ready: false } as ServerAttributes;
    expect(() => resolveSshTarget(server)).toThrow(ValidationError);
    try {
      resolveSshTarget(server);
    } catch (err) {
      expect((err as ValidationError).hints?.some((h) => h.includes("provisioning"))).toBe(true);
      expect((err as ValidationError).hints?.some((h) => h.includes("--private"))).toBe(true);
    }
  });

  it("throws when the private IP is not available", () => {
    const server = { ...baseServer, private_ip_address: null } as ServerAttributes;
    expect(() => resolveSshTarget(server, { private: true })).toThrow(/private IP address/);
  });

  it.each(["0", "70000", "abc", "22.5"])("rejects invalid port %s", (port) => {
    expect(() => resolveSshTarget(baseServer, { port })).toThrow(/Invalid SSH port/);
  });
});

describe("buildSshArgs", () => {
  it("builds connection args without a remote command", () => {
    expect(buildSshArgs({ user: "forge", host: "1.2.3.4", port: 22 })).toEqual([
      "forge@1.2.3.4",
      "-p",
      "22",
    ]);
  });

  it("appends the remote command", () => {
    expect(buildSshArgs({ user: "deploy", host: "1.2.3.4", port: 2222 }, ["uptime"])).toEqual([
      "deploy@1.2.3.4",
      "-p",
      "2222",
      "uptime",
    ]);
  });
});
