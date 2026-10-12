import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handlePhpCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  phpList: vi.fn(async () => {}),
  phpConfig: vi.fn(async () => {}),
  phpUpdateConfig: vi.fn(async () => {}),
  phpMaxUploadSize: vi.fn(async () => {}),
  phpSetMaxUploadSize: vi.fn(async () => {}),
  phpMaxExecutionTime: vi.fn(async () => {}),
  phpSetMaxExecutionTime: vi.fn(async () => {}),
  phpOpcache: vi.fn(async () => {}),
  phpEnableOpcache: vi.fn(async () => {}),
  phpDisableOpcache: vi.fn(async () => {}),
}));

vi.mock("../../audit.ts", () => ({
  getCliAuditLogger: () => ({ log: vi.fn() }),
}));

describe("handlePhpCommand routing", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["list", "phpList"],
    ["ls", "phpList"],
    ["config", "phpConfig"],
    ["update-config", "phpUpdateConfig"],
    ["max-upload-size", "phpMaxUploadSize"],
    ["max-execution-time", "phpMaxExecutionTime"],
    ["opcache", "phpOpcache"],
    ["enable-opcache", "phpEnableOpcache"],
    ["disable-opcache", "phpDisableOpcache"],
  ] as const)("should route %s to %s", async (subcommand, handler) => {
    const handlers = await import("./handlers.ts");
    await handlePhpCommand(subcommand, [], { server: "10" });
    expect(handlers[handler]).toHaveBeenCalledWith(expect.anything());
  });

  it.each([
    ["set-max-upload-size", "phpSetMaxUploadSize"],
    ["set-max-execution-time", "phpSetMaxExecutionTime"],
  ] as const)("should route %s with args to %s", async (subcommand, handler) => {
    const handlers = await import("./handlers.ts");
    await handlePhpCommand(subcommand, ["64"], { server: "10" });
    expect(handlers[handler]).toHaveBeenCalledWith(["64"], expect.anything());
  });

  it("should exit for an unknown subcommand", async () => {
    await handlePhpCommand("unknown", [], {});
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
