import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleSitesCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  sitesList: vi.fn().mockResolvedValue(undefined),
  sitesGet: vi.fn().mockResolvedValue(undefined),
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

  it("should exit for unknown subcommand", async () => {
    await handleSitesCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
