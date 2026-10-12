import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleEnvCommand } from "./command.ts";

// Capture what the audit logger writes instead of writing a real file.
const auditLines = vi.hoisted((): string[] => []);
vi.mock("node:fs", async (importOriginal) => ({
  ...(await importOriginal<typeof import("node:fs")>()),
  mkdirSync: vi.fn(),
  createWriteStream: vi.fn(() => ({
    write(chunk: string) {
      auditLines.push(chunk);
      return true;
    },
  })),
}));

vi.mock("./handlers.ts", () => ({
  envGet: vi.fn().mockResolvedValue(),
  envUpdate: vi.fn().mockResolvedValue(),
}));

vi.mock("../../context.ts", () => ({
  createContext: vi.fn().mockReturnValue({
    options: {},
    formatter: { output: vi.fn(), error: vi.fn() },
  }),
}));

vi.mock("../../output.ts", () => ({
  OutputFormatter: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.output = vi.fn();
    this.error = vi.fn();
  }),
}));

describe("handleEnvCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route get", async () => {
    const h = await import("./handlers.ts");
    await handleEnvCommand("get", [], {});
    expect(h.envGet).toHaveBeenCalled();
  });

  it("should route update", async () => {
    const h = await import("./handlers.ts");
    await handleEnvCommand("update", [], {});
    expect(h.envUpdate).toHaveBeenCalled();
  });

  it("should never write env content to the audit log", async () => {
    auditLines.length = 0;
    const content = "APP_KEY=base64:c2VjcmV0\nDB_PASSWORD=hunter2";

    await handleEnvCommand("update", [], { server: "1", site: "2", content, token: "forge-token" });

    expect(auditLines).toHaveLength(1);
    expect(auditLines[0]).not.toContain("hunter2");
    expect(auditLines[0]).not.toContain("c2VjcmV0");
    expect(auditLines[0]).not.toContain("forge-token");
    expect(JSON.parse(auditLines[0])).toMatchObject({
      source: "cli",
      resource: "env",
      action: "update",
      args: { server: "1", site: "2", content: "[REDACTED]" },
      status: "success",
    });
  });

  it("should exit for unknown subcommand", async () => {
    await handleEnvCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
