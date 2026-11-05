import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleSitesCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  sitesList: vi.fn().mockResolvedValue(),
  sitesGet: vi.fn().mockResolvedValue(),
  sitesUpdate: vi.fn().mockResolvedValue(),
}));

const auditLog = vi.fn();
vi.mock("../../audit.ts", () => ({
  getCliAuditLogger: () => ({ log: auditLog }),
}));

vi.mock("./apply/handler.ts", () => ({
  sitesApply: vi.fn().mockResolvedValue(),
}));

vi.mock("../../context.ts", () => ({
  createContext: vi.fn().mockReturnValue({
    options: { format: "json" },
    formatter: { output: vi.fn(), error: vi.fn() },
  }),
}));

vi.mock("../../output.ts", () => ({
  OutputFormatter: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.output = vi.fn();
    this.error = vi.fn();
  }),
}));

describe("handleSitesCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    const handlers = await import("./handlers.ts");
    vi.mocked(handlers.sitesList).mockClear();
    vi.mocked(handlers.sitesGet).mockClear();
    vi.mocked(handlers.sitesUpdate).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route list subcommand", async () => {
    const handlers = await import("./handlers.ts");
    await handleSitesCommand("list", [], {});
    expect(handlers.sitesList).toHaveBeenCalled();
  });

  it("should route ls alias", async () => {
    const handlers = await import("./handlers.ts");
    await handleSitesCommand("ls", [], {});
    expect(handlers.sitesList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const handlers = await import("./handlers.ts");
    await handleSitesCommand("get", ["1"], {});
    expect(handlers.sitesGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route update with args", async () => {
    const handlers = await import("./handlers.ts");
    await handleSitesCommand("update", ["1"], { server: "123" });
    expect(handlers.sitesUpdate).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route apply and record it in the audit log", async () => {
    const { sitesApply } = await import("./apply/handler.ts");
    await handleSitesCommand("apply", [], { file: "site.json", check: true });
    expect(sitesApply).toHaveBeenCalledWith(expect.anything());
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({ resource: "sites", action: "apply", status: "success" }),
    );
  });

  it("should exit for unknown subcommand", async () => {
    await handleSitesCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
