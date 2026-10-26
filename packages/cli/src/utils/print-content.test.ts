import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { printContent } from "./print-content.ts";

describe("printContent", () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should add a newline when the content does not end with one", () => {
    printContent("server { }");
    expect(stdoutSpy).toHaveBeenCalledWith("server { }\n");
  });

  it("should not add a newline when the content already ends with one", () => {
    printContent("server { }\n");
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy).toHaveBeenCalledWith("server { }\n");
  });
});
