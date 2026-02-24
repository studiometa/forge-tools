import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { OutputFormatter } from "./output.ts";

describe("OutputFormatter", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("JSON format", () => {
    it("should output JSON", () => {
      const formatter = new OutputFormatter("json");
      const data = { key: "value" };

      formatter.output(data);

      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
    });

    it("should output success as JSON", () => {
      const formatter = new OutputFormatter("json");

      formatter.success("Done");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify({ status: "success", message: "Done" }),
      );
    });

    it("should output error as JSON", () => {
      const formatter = new OutputFormatter("json");

      formatter.error("Oops");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        JSON.stringify({ status: "error", message: "Oops", details: undefined }),
      );
    });

    it("should output error with details as JSON", () => {
      const formatter = new OutputFormatter("json");

      formatter.error("Oops", { code: 404 });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        JSON.stringify({ status: "error", message: "Oops", details: { code: 404 } }),
      );
    });

    it("should output warning as JSON", () => {
      const formatter = new OutputFormatter("json");

      formatter.warning("Watch out");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify({ status: "warning", message: "Watch out" }),
      );
    });

    it("should output info as JSON", () => {
      const formatter = new OutputFormatter("json");

      formatter.info("FYI");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify({ status: "info", message: "FYI" }),
      );
    });
  });

  describe("Table format", () => {
    it("should output table with headers and rows", () => {
      const formatter = new OutputFormatter("table");
      const data = [
        { id: 1, name: "Server A" },
        { id: 2, name: "Server B" },
      ];

      formatter.output(data);

      const calls = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      expect(calls.some((c) => c.includes("id"))).toBe(true);
      expect(calls.some((c) => c.includes("name"))).toBe(true);
      expect(calls.some((c) => c.includes("-"))).toBe(true);
      expect(calls.some((c) => c.includes("Server A"))).toBe(true);
    });

    it("should handle empty array", () => {
      const formatter = new OutputFormatter("table");

      formatter.output([]);

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("should handle non-array data", () => {
      const formatter = new OutputFormatter("table");

      formatter.output("some string");

      // Non-array data: no table output
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe("Human format", () => {
    it("should output data as-is", () => {
      const formatter = new OutputFormatter("human");

      formatter.output("Some text");

      expect(consoleLogSpy).toHaveBeenCalledWith("Some text");
    });

    it("should output success with checkmark", () => {
      const formatter = new OutputFormatter("human");

      formatter.success("Done!");

      const output = consoleLogSpy.mock.calls[0][0] as string;
      expect(output).toContain("✓");
      expect(output).toContain("Done!");
    });

    it("should output error with cross", () => {
      const formatter = new OutputFormatter("human");

      formatter.error("Failed");

      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain("✗");
      expect(output).toContain("Failed");
    });

    it("should output error details when provided", () => {
      const formatter = new OutputFormatter("human");

      formatter.error("Failed", "extra info");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it("should output warning with symbol", () => {
      const formatter = new OutputFormatter("human");

      formatter.warning("Careful");

      const output = consoleLogSpy.mock.calls[0][0] as string;
      expect(output).toContain("⚠");
    });

    it("should output info message", () => {
      const formatter = new OutputFormatter("human");

      formatter.info("Here is info");

      const output = consoleLogSpy.mock.calls[0][0] as string;
      expect(output).toContain("Here is info");
    });
  });

  describe("No-color mode", () => {
    it("should still work with no-color", () => {
      const formatter = new OutputFormatter("human", true);

      formatter.success("OK");

      const output = consoleLogSpy.mock.calls[0][0] as string;
      expect(output).toContain("✓");
    });
  });
});
