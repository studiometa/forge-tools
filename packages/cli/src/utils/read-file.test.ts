import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { OutputFormatter } from "../output.ts";
import { readInputFile } from "./read-file.ts";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

const options = { field: "file", usage: "forge test --file <path>", label: "test input" };

describe("readInputFile", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  const formatter = new OutputFormatter("human", true);

  beforeEach(() => {
    vi.clearAllMocks();
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads a file path", async () => {
    const { readFileSync } = await import("node:fs");
    vi.mocked(readFileSync).mockReturnValue("content");

    expect(readInputFile("input.txt", options, formatter)).toBe("content");
    expect(vi.mocked(readFileSync)).toHaveBeenCalledWith("input.txt", "utf8");
  });

  it("reads stdin when the path is a dash", async () => {
    const { readFileSync } = await import("node:fs");
    vi.mocked(readFileSync).mockReturnValue("from stdin");

    expect(readInputFile("-", options, formatter)).toBe("from stdin");
    expect(vi.mocked(readFileSync)).toHaveBeenCalledWith(0, "utf8");
  });

  it.each([undefined, true, ""])("exits when the path is %s", async (path) => {
    const { readFileSync } = await import("node:fs");

    expect(() => readInputFile(path, options, formatter)).toThrow("--file requires a path");
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(readFileSync)).not.toHaveBeenCalled();
  });

  it("exits with the label and reason when the file cannot be read", async () => {
    const { readFileSync } = await import("node:fs");
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });

    expect(() => readInputFile("missing.txt", options, formatter)).toThrow(
      "Cannot read test input from missing.txt: ENOENT",
    );
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("reports a non-Error value thrown while reading", async () => {
    const { readFileSync } = await import("node:fs");
    vi.mocked(readFileSync).mockImplementation(() => {
      // oxlint-disable-next-line no-throw-literal
      throw "boom";
    });

    expect(() => readInputFile("missing.txt", options, formatter)).toThrow(
      "Cannot read test input from missing.txt: boom",
    );
  });
});
