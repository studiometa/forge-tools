import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleConfigCommand, showConfigHelp } from "./config.ts";

vi.mock("../config.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../config.ts")>();
  return {
    ...actual,
    createConfigStore: vi.fn().mockReturnValue({}),
    getToken: vi.fn().mockReturnValue(null),
    setToken: vi.fn(),
    deleteToken: vi.fn(),
  };
});

describe("showConfigHelp", () => {
  it("should print help text", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    showConfigHelp();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("forge-cli config"));
    spy.mockRestore();
  });
});

describe("handleConfigCommand", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("set subcommand", () => {
    it("should save token", async () => {
      const { setToken } = await import("../config.ts");

      handleConfigCommand("set", ["my-token"], { format: "json" });

      expect(setToken).toHaveBeenCalledWith("my-token", expect.anything());
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("success"));
    });

    it("should exit with error when no token", () => {
      handleConfigCommand("set", [], { format: "json" });
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("get subcommand", () => {
    it("should show warning when no token configured", async () => {
      const { getToken } = await import("../config.ts");
      vi.mocked(getToken).mockReturnValue(null);

      handleConfigCommand("get", [], { format: "human" });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("⚠"));
    });

    it("should show masked token in human format", async () => {
      const { getToken } = await import("../config.ts");
      vi.mocked(getToken).mockReturnValue("abcd1234efgh5678");

      handleConfigCommand("get", [], { format: "human" });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("abcd"));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("5678"));
    });

    it("should show masked token in json format", async () => {
      const { getToken } = await import("../config.ts");
      vi.mocked(getToken).mockReturnValue("abcd1234efgh5678");

      handleConfigCommand("get", [], { format: "json" });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("apiToken"));
    });

    it("should handle short token masking", async () => {
      const { getToken } = await import("../config.ts");
      vi.mocked(getToken).mockReturnValue("short");

      handleConfigCommand("get", [], { format: "human" });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("****"));
    });
  });

  describe("delete subcommand", () => {
    it("should delete token", async () => {
      const { deleteToken } = await import("../config.ts");

      handleConfigCommand("delete", [], { format: "json" });

      expect(deleteToken).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("success"));
    });
  });

  describe("unknown subcommand", () => {
    it("should show help for unknown subcommand", () => {
      handleConfigCommand("unknown", [], {});
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("forge-cli config"));
    });
  });
});
