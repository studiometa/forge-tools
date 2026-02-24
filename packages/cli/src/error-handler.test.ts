import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { OutputFormatter } from "./output.ts";
import { ApiError, ConfigError, ValidationError } from "./errors.ts";
import {
  ExitCode,
  getExitCode,
  handleError,
  runCommand,
  exitWithValidationError,
} from "./error-handler.ts";

describe("getExitCode", () => {
  it("should return VALIDATION_ERROR for ValidationError", () => {
    expect(getExitCode(ValidationError.required("id"))).toBe(ExitCode.VALIDATION_ERROR);
  });

  it("should return AUTHENTICATION_ERROR for 401 ApiError", () => {
    expect(getExitCode(new ApiError("Unauthorized", 401))).toBe(ExitCode.AUTHENTICATION_ERROR);
  });

  it("should return NOT_FOUND_ERROR for 404 ApiError", () => {
    expect(getExitCode(new ApiError("Not Found", 404))).toBe(ExitCode.NOT_FOUND_ERROR);
  });

  it("should return GENERAL_ERROR for other ApiError", () => {
    expect(getExitCode(new ApiError("Server error", 500))).toBe(ExitCode.GENERAL_ERROR);
  });

  it("should return CONFIG_ERROR for ConfigError", () => {
    expect(getExitCode(ConfigError.missingToken())).toBe(ExitCode.CONFIG_ERROR);
  });

  it("should return GENERAL_ERROR for unknown errors", () => {
    expect(getExitCode(new Error("unknown"))).toBe(ExitCode.GENERAL_ERROR);
    expect(getExitCode("string error")).toBe(ExitCode.GENERAL_ERROR);
  });
});

describe("handleError", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call process.exit by default", () => {
    const formatter = new OutputFormatter("human", true);
    handleError(new Error("oops"), formatter);
    expect(processExitSpy).toHaveBeenCalledWith(ExitCode.GENERAL_ERROR);
  });

  it("should not call process.exit when exit=false", () => {
    const formatter = new OutputFormatter("human", true);
    handleError(new Error("oops"), formatter, { exit: false });
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("should return exit code when exit=false", () => {
    const formatter = new OutputFormatter("human", true);
    const code = handleError(ValidationError.required("id"), formatter, { exit: false });
    expect(code).toBe(ExitCode.VALIDATION_ERROR);
  });

  it("should output JSON error for json format", () => {
    const formatter = new OutputFormatter("json", true);
    (formatter as unknown as { format: string }).format = "json";
    handleError(new ApiError("Not Found", 404), formatter, { exit: false });
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"API_ERROR"'));
  });

  it("should output human error for human format", () => {
    const formatter = new OutputFormatter("human", true);
    handleError(new ApiError("Not Found", 404), formatter, { exit: false });
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Not Found"));
  });

  it("should wrap non-CliError in ApiError", () => {
    const formatter = new OutputFormatter("human", true);
    handleError(new Error("raw error"), formatter, { exit: false });
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("raw error"));
  });
});

describe("runCommand", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return result on success", async () => {
    const formatter = new OutputFormatter("json", true);
    const result = await runCommand(async () => "done", formatter);
    expect(result).toBe("done");
  });

  it("should handle errors and call process.exit", async () => {
    const formatter = new OutputFormatter("human", true);
    await runCommand(async () => {
      throw new Error("fail");
    }, formatter);
    expect(processExitSpy).toHaveBeenCalled();
  });
});

describe("exitWithValidationError", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call process.exit with VALIDATION_ERROR code", () => {
    const formatter = new OutputFormatter("human", true);
    try {
      exitWithValidationError("server_id", "forge-cli servers get <server_id>", formatter);
    } catch {
      // process.exit is mocked so exitWithValidationError throws
    }
    expect(processExitSpy).toHaveBeenCalledWith(ExitCode.VALIDATION_ERROR);
  });
});
