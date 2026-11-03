import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleStorageProvidersCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  storageProvidersList: vi.fn().mockResolvedValue(),
  storageProvidersGet: vi.fn().mockResolvedValue(),
  storageProvidersCreate: vi.fn().mockResolvedValue(),
  storageProvidersDelete: vi.fn().mockResolvedValue(),
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

vi.mock("../../audit.ts", () => ({
  getCliAuditLogger: () => ({ log: vi.fn() }),
}));

describe("handleStorageProvidersCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route list and ls", async () => {
    const h = await import("./handlers.ts");
    await handleStorageProvidersCommand("list", [], {});
    await handleStorageProvidersCommand("ls", [], {});
    expect(h.storageProvidersList).toHaveBeenCalledTimes(2);
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleStorageProvidersCommand("get", ["3"], {});
    expect(h.storageProvidersGet).toHaveBeenCalledWith(["3"], expect.anything());
  });

  it("should route create", async () => {
    const h = await import("./handlers.ts");
    await handleStorageProvidersCommand("create", [], {});
    expect(h.storageProvidersCreate).toHaveBeenCalled();
  });

  it("should route delete with args", async () => {
    const h = await import("./handlers.ts");
    await handleStorageProvidersCommand("delete", ["3"], {});
    expect(h.storageProvidersDelete).toHaveBeenCalledWith(["3"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleStorageProvidersCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
