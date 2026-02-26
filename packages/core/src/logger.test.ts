import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock node:fs so no real files are written
vi.mock("node:fs", () => ({
  createWriteStream: vi.fn(),
  mkdirSync: vi.fn(),
}));

// Mock node:os so homedir is predictable
vi.mock("node:os", () => ({
  homedir: vi.fn().mockReturnValue("/home/testuser"),
}));

// Mock pino so we can spy on its output without real I/O
vi.mock("pino", () => {
  const mockInfo = vi.fn();
  const mockLogger = { info: mockInfo };
  const mockPino = vi.fn().mockReturnValue(mockLogger);
  // Expose helpers for assertions
  (mockPino as unknown as Record<string, unknown>)._mockLogger = mockLogger;
  (mockPino as unknown as Record<string, unknown>)._mockInfo = mockInfo;
  return { default: mockPino };
});

import { createWriteStream, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import pino from "pino";
import { createAuditLogger, getAuditLogPath, sanitizeArgs } from "./logger.ts";

const mockedCreateWriteStream = vi.mocked(createWriteStream);
const mockedMkdirSync = vi.mocked(mkdirSync);
const mockedPino = vi.mocked(pino);
const mockedHomedir = vi.mocked(homedir);

// Access the mock info spy from the pino mock factory
function getMockInfo(): ReturnType<typeof vi.fn> {
  return (mockedPino as unknown as Record<string, unknown>)._mockInfo as ReturnType<typeof vi.fn>;
}

describe("sanitizeArgs", () => {
  it("should return args unchanged when no sensitive keys are present", () => {
    const args = { resource: "servers", server_id: "1" };
    expect(sanitizeArgs(args)).toEqual(args);
  });

  it("should redact apiToken", () => {
    const args = { apiToken: "secret-token", resource: "servers" };
    const result = sanitizeArgs(args);
    expect(result.apiToken).toBe("[REDACTED]");
    expect(result.resource).toBe("servers");
  });

  it("should redact token", () => {
    const args = { token: "my-token" };
    expect(sanitizeArgs(args).token).toBe("[REDACTED]");
  });

  it("should redact password", () => {
    const args = { password: "hunter2" };
    expect(sanitizeArgs(args).password).toBe("[REDACTED]");
  });

  it("should redact secret", () => {
    const args = { secret: "shh" };
    expect(sanitizeArgs(args).secret).toBe("[REDACTED]");
  });

  it("should redact key", () => {
    const args = { key: "ssh-rsa ..." };
    expect(sanitizeArgs(args).key).toBe("[REDACTED]");
  });

  it("should redact credentials", () => {
    const args = { credentials: [{ username: "user", password: "pass" }] };
    expect(sanitizeArgs(args).credentials).toBe("[REDACTED]");
  });

  it("should not mutate the original args", () => {
    const args = { apiToken: "secret", resource: "servers" };
    sanitizeArgs(args);
    expect(args.apiToken).toBe("secret");
  });
});

describe("getAuditLogPath", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.FORGE_AUDIT_LOG;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should return the env var path when FORGE_AUDIT_LOG is set", () => {
    process.env.FORGE_AUDIT_LOG = "/custom/path/audit.log";
    expect(getAuditLogPath()).toBe("/custom/path/audit.log");
  });

  it("should return the default path when FORGE_AUDIT_LOG is not set", () => {
    expect(getAuditLogPath()).toBe("/home/testuser/.config/forge-tools/audit.log");
  });

  it("should use homedir() for the default path", () => {
    mockedHomedir.mockReturnValueOnce("/other/home");
    expect(getAuditLogPath()).toBe("/other/home/.config/forge-tools/audit.log");
  });
});

describe("createAuditLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Provide a fake stream object
    mockedCreateWriteStream.mockReturnValue({} as ReturnType<typeof createWriteStream>);
  });

  it("should create a write stream in append mode", () => {
    createAuditLogger("mcp");
    expect(mockedCreateWriteStream).toHaveBeenCalledWith(expect.stringContaining("audit.log"), {
      flags: "a",
    });
  });

  it("should call mkdirSync to ensure the directory exists", () => {
    createAuditLogger("mcp");
    expect(mockedMkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it("should call pino with the stream", () => {
    const fakeStream = { write: vi.fn() } as unknown as ReturnType<typeof createWriteStream>;
    mockedCreateWriteStream.mockReturnValue(fakeStream);

    createAuditLogger("cli");

    expect(mockedPino).toHaveBeenCalledWith({ level: "info" }, fakeStream);
  });

  it("should log with correct fields on success (mcp source)", () => {
    const logger = createAuditLogger("mcp");
    const mockInfo = getMockInfo();

    logger.log({
      source: "mcp",
      resource: "servers",
      action: "reboot",
      args: { server_id: "1" },
      status: "success",
    });

    expect(mockInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "mcp",
        resource: "servers",
        action: "reboot",
        args: { server_id: "1" },
        status: "success",
      }),
    );
  });

  it("should log with correct fields on success (cli source)", () => {
    const logger = createAuditLogger("cli");
    const mockInfo = getMockInfo();

    logger.log({
      source: "cli",
      resource: "deployments",
      action: "deploy",
      args: { server_id: "1", site_id: "2" },
      status: "success",
    });

    expect(mockInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "cli",
        resource: "deployments",
        action: "deploy",
        status: "success",
      }),
    );
  });

  it("should include error field when status is error", () => {
    const logger = createAuditLogger("mcp");
    const mockInfo = getMockInfo();

    logger.log({
      source: "mcp",
      resource: "sites",
      action: "delete",
      args: { id: "99" },
      status: "error",
      error: "Not found",
    });

    expect(mockInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        error: "Not found",
      }),
    );
  });

  it("should not include error field when status is success", () => {
    const logger = createAuditLogger("mcp");
    const mockInfo = getMockInfo();

    logger.log({
      source: "mcp",
      resource: "sites",
      action: "create",
      args: {},
      status: "success",
    });

    const call = mockInfo.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(call).not.toHaveProperty("error");
  });

  it("should sanitize sensitive args before logging", () => {
    const logger = createAuditLogger("cli");
    const mockInfo = getMockInfo();

    logger.log({
      source: "cli",
      resource: "servers",
      action: "create",
      args: { apiToken: "my-secret-token", name: "web-01" },
      status: "success",
    });

    const call = mockInfo.mock.calls[0]?.[0] as Record<string, unknown>;
    const loggedArgs = call.args as Record<string, unknown>;
    expect(loggedArgs.apiToken).toBe("[REDACTED]");
    expect(loggedArgs.name).toBe("web-01");
  });

  it("should be a silent no-op when createWriteStream throws", () => {
    mockedCreateWriteStream.mockImplementation(() => {
      throw new Error("permission denied");
    });

    let logger: ReturnType<typeof createAuditLogger>;
    expect(() => {
      logger = createAuditLogger("mcp");
    }).not.toThrow();

    expect(() => {
      logger!.log({
        source: "mcp",
        resource: "servers",
        action: "reboot",
        args: {},
        status: "success",
      });
    }).not.toThrow();
  });

  it("should be a silent no-op when mkdirSync throws", () => {
    mockedMkdirSync.mockImplementation(() => {
      throw new Error("EACCES: permission denied");
    });

    let logger: ReturnType<typeof createAuditLogger>;
    expect(() => {
      logger = createAuditLogger("cli");
    }).not.toThrow();

    expect(() => {
      logger!.log({
        source: "cli",
        resource: "servers",
        action: "reboot",
        args: {},
        status: "success",
      });
    }).not.toThrow();
  });

  it("should be a silent no-op when pino.info throws", () => {
    const mockInfo = getMockInfo();
    mockInfo.mockImplementationOnce(() => {
      throw new Error("write error");
    });

    const logger = createAuditLogger("mcp");

    expect(() => {
      logger.log({
        source: "mcp",
        resource: "servers",
        action: "reboot",
        args: {},
        status: "success",
      });
    }).not.toThrow();
  });
});
