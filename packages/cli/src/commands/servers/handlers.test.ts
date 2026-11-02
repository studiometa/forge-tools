import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ServerAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { serversList, serversGet, serversCreate, serversReboot } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listServers: vi.fn(),
  getServer: vi.fn(),
  createServer: vi.fn(),
  rebootServer: vi.fn(),
}));

const mockServer: ServerAttributes & { id: number } = {
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

  it("should show 'provisioning' for servers not yet ready", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({ data: [{ ...mockServer, is_ready: false }] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human" },
    });

    await serversList(ctx);
    const logSpy = vi.mocked(console.log);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("provisioning"));
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

describe("serversList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with lineFormat callback", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({ data: [mockServer] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human" },
    });
    await serversList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });

  it("should use short flag 'f' as format fallback when format is not set", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({ data: [mockServer] });
    // Pass options with no format key but with f alias
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { f: "json" } as never,
    });
    await serversList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });

  it("should default to human format when neither format nor f is set", async () => {
    const { listServers } = await import("@studiometa/forge-core");
    vi.mocked(listServers).mockResolvedValue({ data: [mockServer] });
    const ctx = createTestContext({ token: "test", mockClient: {} as never, options: {} as never });
    await serversList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});

describe("serversCreate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a Custom VPS app server on Ubuntu 24.04 by default", async () => {
    const { createServer } = await import("@studiometa/forge-core");
    vi.mocked(createServer).mockResolvedValue({ data: { ...mockServer, provider: "custom" } });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", name: "my-server", "ip-address": "1.2.3.4" },
    });

    await serversCreate(ctx);
    expect(createServer).toHaveBeenCalledWith(
      {
        name: "my-server",
        provider: "custom",
        type: "app",
        ubuntu_version: "24.04",
        custom: { ip_address: "1.2.3.4" },
      },
      expect.anything(),
    );
    const logSpy = vi.mocked(console.log);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("created (ID 1)"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("provisioning command"));
  });

  it("should send every optional field", async () => {
    const { createServer } = await import("@studiometa/forge-core");
    vi.mocked(createServer).mockResolvedValue({ data: mockServer });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        name: "my-server",
        "ip-address": "1.2.3.4",
        "private-ip": "10.0.0.1",
        "ssh-port": "2222",
        type: "database",
        "ubuntu-version": "26.04",
        "php-version": "php84",
        database: "mariadb1011",
        tag: ["prod", "ovh"],
      },
    });

    await serversCreate(ctx);
    expect(createServer).toHaveBeenCalledWith(
      {
        name: "my-server",
        provider: "custom",
        type: "database",
        ubuntu_version: "26.04",
        php_version: "php84",
        database_type: "mariadb1011",
        tags: ["prod", "ovh"],
        custom: { ip_address: "1.2.3.4", private_ip_address: "10.0.0.1", ssh_port: "2222" },
      },
      expect.anything(),
    );
    const logSpy = vi.mocked(console.log);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"my-server"'));
  });

  it("should send region and size for a cloud provider", async () => {
    const { createServer } = await import("@studiometa/forge-core");
    vi.mocked(createServer).mockResolvedValue({ data: mockServer });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "human",
        name: "my-server",
        provider: "hetzner",
        "credential-id": "42",
        region: "fsn1",
        size: "cpx31",
        tag: "prod",
      },
    });

    await serversCreate(ctx);
    expect(createServer).toHaveBeenCalledWith(
      {
        name: "my-server",
        provider: "hetzner",
        type: "app",
        ubuntu_version: "24.04",
        credential_id: "42",
        tags: ["prod"],
        hetzner: { region_id: "fsn1", size_id: "cpx31" },
      },
      expect.anything(),
    );
    const logSpy = vi.mocked(console.log);
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining("provisioning command"));
  });

  it("should exit with validation error when no name", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", "ip-address": "1.2.3.4" },
    });

    await serversCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with validation error when a Custom VPS has no IP address", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", name: "my-server" },
    });

    await serversCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should handle API errors", async () => {
    const { createServer } = await import("@studiometa/forge-core");
    vi.mocked(createServer).mockRejectedValue(new Error("validation failed"));

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", name: "my-server", "ip-address": "1.2.3.4" },
    });

    await serversCreate(ctx);
    expect(processExitSpy).toHaveBeenCalled();
  });
});
