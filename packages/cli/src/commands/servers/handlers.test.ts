import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeServer } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { serversList, serversGet, serversReboot } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listServers: vi.fn(),
  getServer: vi.fn(),
  rebootServer: vi.fn(),
}));

const mockServer: ForgeServer = {
  id: 1,
  credential_id: 0,
  name: "my-server",
  type: "app",
  provider: "ocean2",
  provider_id: "abc",
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
  local_public_key: "ssh-rsa ...",
  is_ready: true,
  revoked: false,
  created_at: "2024-01-01T00:00:00Z",
  network: [],
  tags: [],
};

describe("serversList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list servers in json format", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({ data: [mockServer] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await serversList(ctx);
    const logSpy = vi.mocked(console.log);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"my-server"'));
  });

  it("should show message when no servers in human format", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({ data: [] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human" },
    });

    await serversList(ctx);
    const logSpy = vi.mocked(console.log);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("No servers found"));
  });

  it("should list servers in human format", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({ data: [mockServer] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human" },
    });

    await serversList(ctx);
    const logSpy = vi.mocked(console.log);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("my-server"));
  });

  it("should list servers in table format", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({ data: [mockServer] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "table" },
    });

    await serversList(ctx);
    const logSpy = vi.mocked(console.log);
    expect(logSpy).toHaveBeenCalled();
  });

  it("should handle API errors", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockRejectedValue(new Error("API error"));

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await serversList(ctx);
    expect(processExitSpy).toHaveBeenCalled();
  });
});

describe("serversGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get server by id", async () => {
    const { getServer } = await import("@studiometa/forge-core");
    vi.mocked(getServer).mockResolvedValue({ data: mockServer });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await serversGet(["1"], ctx);
    const logSpy = vi.mocked(console.log);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"my-server"'));
  });

  it("should exit with validation error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human" },
    });

    await serversGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3); // VALIDATION_ERROR
  });

  it("should handle API errors", async () => {
    const { getServer } = await import("@studiometa/forge-core");
    vi.mocked(getServer).mockRejectedValue(new Error("not found"));

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await serversGet(["999"], ctx);
    expect(processExitSpy).toHaveBeenCalled();
  });
});

describe("serversReboot", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should reboot server by id", async () => {
    const { rebootServer } = await import("@studiometa/forge-core");
    vi.mocked(rebootServer).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human" },
    });

    await serversReboot(["1"], ctx);
    const logSpy = vi.mocked(console.log);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("reboot initiated"));
  });

  it("should exit with validation error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human" },
    });

    await serversReboot([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});
