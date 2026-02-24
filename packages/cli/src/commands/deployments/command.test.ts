import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleDeploymentsCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  deploymentsList: vi.fn().mockResolvedValue(undefined),
  deploymentsDeploy: vi.fn().mockResolvedValue(undefined),
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

describe("handleDeploymentsCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    const handlers = await import("./handlers.ts");
    vi.mocked(handlers.deploymentsList).mockClear();
    vi.mocked(handlers.deploymentsDeploy).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route list subcommand", async () => {
    const handlers = await import("./handlers.ts");
    await handleDeploymentsCommand("list", [], {});
    expect(handlers.deploymentsList).toHaveBeenCalled();
  });

  it("should route deploy subcommand", async () => {
    const handlers = await import("./handlers.ts");
    await handleDeploymentsCommand("deploy", [], {});
    expect(handlers.deploymentsDeploy).toHaveBeenCalled();
  });

  it("should exit for unknown subcommand", async () => {
    await handleDeploymentsCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
