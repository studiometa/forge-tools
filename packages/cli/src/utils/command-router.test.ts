import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createCommandRouter } from "./command-router.ts";

// Mock context creation
vi.mock("../context.ts", () => ({
  createContext: vi.fn().mockReturnValue({
    options: { format: "json" },
    formatter: {
      output: vi.fn(),
      error: vi.fn(),
    },
  }),
}));

// Mock OutputFormatter as a proper class constructor
vi.mock("../output.ts", () => ({
  OutputFormatter: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.output = vi.fn();
    this.error = vi.fn();
  }),
}));

describe("createCommandRouter", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call a list handler for a matching subcommand", async () => {
    const listHandler = vi.fn().mockResolvedValue(undefined);
    const router = createCommandRouter({
      resource: "servers",
      handlers: {
        list: listHandler,
      },
    });

    await router("list", [], { format: "json" });
    expect(listHandler).toHaveBeenCalledTimes(1);
  });

  it("should call an args handler with args and context", async () => {
    const argsHandler = vi.fn().mockResolvedValue(undefined);
    const router = createCommandRouter({
      resource: "servers",
      handlers: {
        get: [argsHandler, "args"],
      },
    });

    await router("get", ["123"], { format: "json" });
    expect(argsHandler).toHaveBeenCalledWith(["123"], expect.anything());
  });

  it("should route alias subcommands", async () => {
    const listHandler = vi.fn().mockResolvedValue(undefined);
    const router = createCommandRouter({
      resource: "servers",
      handlers: {
        list: listHandler,
        ls: listHandler,
      },
    });

    await router("ls", [], {});
    expect(listHandler).toHaveBeenCalledTimes(1);
  });

  it("should exit with error for unknown subcommand", async () => {
    const router = createCommandRouter({
      resource: "servers",
      handlers: {},
    });

    await router("unknown", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should error with unknown subcommand message", async () => {
    const router = createCommandRouter({
      resource: "sites",
      handlers: {},
    });

    await router("notexist", [], {});
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should use no-color option", async () => {
    const { OutputFormatter } = await import("../output.ts");

    const router = createCommandRouter({
      resource: "servers",
      handlers: {
        list: vi.fn().mockResolvedValue(undefined),
      },
    });

    await router("list", [], { "no-color": true });
    expect(OutputFormatter).toHaveBeenCalledWith(expect.any(String), true);
  });
});
