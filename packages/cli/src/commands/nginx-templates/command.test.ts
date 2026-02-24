import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleNginxTemplatesCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  nginxTemplatesList: vi.fn().mockResolvedValue(undefined),
  nginxTemplatesGet: vi.fn().mockResolvedValue(undefined),
  nginxTemplatesCreate: vi.fn().mockResolvedValue(undefined),
  nginxTemplatesUpdate: vi.fn().mockResolvedValue(undefined),
  nginxTemplatesDelete: vi.fn().mockResolvedValue(undefined),
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

describe("handleNginxTemplatesCommand routing", () => {
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
    await handleNginxTemplatesCommand("list", [], {});
    expect(h.nginxTemplatesList).toHaveBeenCalled();
  });

  it("should route ls", async () => {
    const h = await import("./handlers.ts");
    await handleNginxTemplatesCommand("ls", [], {});
    expect(h.nginxTemplatesList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleNginxTemplatesCommand("get", ["1"], {});
    expect(h.nginxTemplatesGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route create", async () => {
    const h = await import("./handlers.ts");
    await handleNginxTemplatesCommand("create", [], {});
    expect(h.nginxTemplatesCreate).toHaveBeenCalled();
  });

  it("should route update with args", async () => {
    const h = await import("./handlers.ts");
    await handleNginxTemplatesCommand("update", ["1"], {});
    expect(h.nginxTemplatesUpdate).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route delete with args", async () => {
    const h = await import("./handlers.ts");
    await handleNginxTemplatesCommand("delete", ["1"], {});
    expect(h.nginxTemplatesDelete).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleNginxTemplatesCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
