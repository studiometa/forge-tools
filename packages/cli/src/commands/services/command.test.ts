import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleServicesCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  servicesList: vi.fn().mockResolvedValue(),
  servicesRestart: vi.fn().mockResolvedValue(),
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

describe("handleServicesCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route list with args", async () => {
    const h = await import("./handlers.ts");
    await handleServicesCommand("list", ["10"], {});
    expect(h.servicesList).toHaveBeenCalledWith(["10"], expect.anything());
  });

  it("should route ls to list", async () => {
    const h = await import("./handlers.ts");
    await handleServicesCommand("ls", ["10"], {});
    expect(h.servicesList).toHaveBeenCalledWith(["10"], expect.anything());
  });

  it("should route restart with args", async () => {
    const h = await import("./handlers.ts");
    await handleServicesCommand("restart", ["10", "nginx"], {});
    expect(h.servicesRestart).toHaveBeenCalledWith(["10", "nginx"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleServicesCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
