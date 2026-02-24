import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleCertificatesCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  certificatesList: vi.fn().mockResolvedValue(undefined),
  certificatesGet: vi.fn().mockResolvedValue(undefined),
  certificatesActivate: vi.fn().mockResolvedValue(undefined),
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

describe("handleCertificatesCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route list", async () => {
    const h = await import("./handlers.ts");
    await handleCertificatesCommand("list", [], {});
    expect(h.certificatesList).toHaveBeenCalled();
  });

  it("should route activate with args", async () => {
    const h = await import("./handlers.ts");
    await handleCertificatesCommand("activate", ["1"], {});
    expect(h.certificatesActivate).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleCertificatesCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
