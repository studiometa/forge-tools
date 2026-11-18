import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleCertificatesCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  certificatesList: vi.fn().mockResolvedValue(),
  certificatesGet: vi.fn().mockResolvedValue(),
  certificatesActivate: vi.fn().mockResolvedValue(),
  certificatesCreate: vi.fn().mockResolvedValue(),
  certificatesDelete: vi.fn().mockResolvedValue(),
  certificatesDeactivate: vi.fn().mockResolvedValue(),
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

  it("should route list and ls", async () => {
    const h = await import("./handlers.ts");
    await handleCertificatesCommand("list", [], {});
    await handleCertificatesCommand("ls", [], {});
    expect(h.certificatesList).toHaveBeenCalledTimes(2);
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleCertificatesCommand("get", [], {});
    expect(h.certificatesGet).toHaveBeenCalled();
  });

  it("should route activate with args", async () => {
    const h = await import("./handlers.ts");
    await handleCertificatesCommand("activate", [], {});
    expect(h.certificatesActivate).toHaveBeenCalled();
  });

  it("should route create, delete and deactivate", async () => {
    const h = await import("./handlers.ts");
    await handleCertificatesCommand("create", [], {});
    await handleCertificatesCommand("delete", ["1"], {});
    await handleCertificatesCommand("deactivate", ["1"], {});
    expect(h.certificatesCreate).toHaveBeenCalled();
    expect(h.certificatesDelete).toHaveBeenCalledWith(["1"], expect.anything());
    expect(h.certificatesDeactivate).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleCertificatesCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
