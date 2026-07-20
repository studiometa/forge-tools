import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ServerAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { sshConnect } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  getServer: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  spawnSync: vi.fn(),
}));

const auditLog = vi.fn();
vi.mock("../../audit.ts", () => ({
  getCliAuditLogger: () => ({ log: auditLog }),
}));

const mockServer: ServerAttributes = {
  id: 123,
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

function ctxWith(options: Record<string, string | boolean>) {
  return createTestContext({
    token: "test",
    mockClient: {} as never,
    options: { "no-color": true, ...options },
  });
}

describe("sshConnect", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    auditLog.mockClear();

    const { getServer } = await import("@studiometa/forge-core");
    vi.mocked(getServer).mockResolvedValue({ data: mockServer });

    const { spawnSync } = await import("node:child_process");
    vi.mocked(spawnSync).mockReturnValue({ status: 0 } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exits with a validation error when no server is given", async () => {
    await sshConnect(undefined, [], ctxWith({ format: "json" })).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("prints the resolved command as JSON without connecting", async () => {
    const { spawnSync } = await import("node:child_process");
    await sshConnect("123", [], ctxWith({ format: "json" }));

    expect(spawnSync).not.toHaveBeenCalled();
    const payload = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
    expect(payload.command).toBe("ssh forge@1.2.3.4 -p 22");
    expect(payload.user).toBe("forge");
  });

  it("prints the command in --dry-run mode", async () => {
    const { spawnSync } = await import("node:child_process");
    await sshConnect("123", [], ctxWith({ format: "human", "dry-run": true }));

    expect(spawnSync).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith("ssh forge@1.2.3.4 -p 22");
  });

  it("spawns ssh interactively with the resolved args", async () => {
    const { spawnSync } = await import("node:child_process");
    await sshConnect("123", [], ctxWith({ format: "human", user: "deploy", private: true }));

    expect(spawnSync).toHaveBeenCalledWith("ssh", ["deploy@10.0.0.1", "-p", "22"], {
      stdio: "inherit",
    });
    expect(auditLog).toHaveBeenCalledWith(expect.objectContaining({ status: "success" }));
  });

  it("appends a remote command", async () => {
    const { spawnSync } = await import("node:child_process");
    await sshConnect("123", ["uptime"], ctxWith({ format: "human" }));

    expect(spawnSync).toHaveBeenCalledWith("ssh", ["forge@1.2.3.4", "-p", "22", "uptime"], {
      stdio: "inherit",
    });
  });

  it("propagates a non-zero ssh exit code", async () => {
    const { spawnSync } = await import("node:child_process");
    vi.mocked(spawnSync).mockReturnValue({ status: 42 } as never);

    await sshConnect("123", [], ctxWith({ format: "human" }));
    expect(processExitSpy).toHaveBeenCalledWith(42);
  });

  it("logs an error and reports when ssh cannot be spawned", async () => {
    const { spawnSync } = await import("node:child_process");
    vi.mocked(spawnSync).mockReturnValue({ error: new Error("spawn ssh ENOENT") } as never);

    await sshConnect("123", [], ctxWith({ format: "human" }));

    expect(auditLog).toHaveBeenCalledWith(expect.objectContaining({ status: "error" }));
    // runCommand catches the rethrown error and exits with the general error code.
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
