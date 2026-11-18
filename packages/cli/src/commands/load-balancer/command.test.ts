import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handleLoadBalancerCommand } from "./command.ts";

const auditLog = vi.fn();
vi.mock("../../audit.ts", () => ({
  getCliAuditLogger: () => ({ log: auditLog }),
}));

vi.mock("./apply/handler.ts", () => ({
  loadBalancerApply: vi.fn().mockResolvedValue(),
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

describe("handleLoadBalancerCommand routing", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("routes apply and records it in the audit log", async () => {
    const { loadBalancerApply } = await import("./apply/handler.ts");
    await handleLoadBalancerCommand("apply", [], { file: "load-balancer.json" });
    expect(loadBalancerApply).toHaveBeenCalledWith(expect.anything());
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({ resource: "load-balancer", action: "apply", status: "success" }),
    );
  });

  it("exits for an unknown subcommand", async () => {
    await handleLoadBalancerCommand("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
