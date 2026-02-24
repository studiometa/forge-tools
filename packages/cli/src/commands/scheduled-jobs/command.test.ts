import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleScheduledJobsCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  scheduledJobsList: vi.fn().mockResolvedValue(undefined),
  scheduledJobsGet: vi.fn().mockResolvedValue(undefined),
  scheduledJobsCreate: vi.fn().mockResolvedValue(undefined),
  scheduledJobsDelete: vi.fn().mockResolvedValue(undefined),
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

describe("handleScheduledJobsCommand routing", () => {
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
    await handleScheduledJobsCommand("list", [], {});
    expect(h.scheduledJobsList).toHaveBeenCalled();
  });

  it("should route ls", async () => {
    const h = await import("./handlers.ts");
    await handleScheduledJobsCommand("ls", [], {});
    expect(h.scheduledJobsList).toHaveBeenCalled();
  });

  it("should route get with args", async () => {
    const h = await import("./handlers.ts");
    await handleScheduledJobsCommand("get", ["1"], {});
    expect(h.scheduledJobsGet).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should route create", async () => {
    const h = await import("./handlers.ts");
    await handleScheduledJobsCommand("create", [], {});
    expect(h.scheduledJobsCreate).toHaveBeenCalled();
  });

  it("should route delete with args", async () => {
    const h = await import("./handlers.ts");
    await handleScheduledJobsCommand("delete", ["1"], {});
    expect(h.scheduledJobsDelete).toHaveBeenCalledWith(["1"], expect.anything());
  });

  it("should exit for unknown subcommand", async () => {
    await handleScheduledJobsCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
