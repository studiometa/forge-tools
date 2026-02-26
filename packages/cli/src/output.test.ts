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

  describe("isJson()", () => {
    it("should return true for json format", () => {
      expect(new OutputFormatter("json").isJson()).toBe(true);
    });

    it("should return false for human format", () => {
      expect(new OutputFormatter("human").isJson()).toBe(false);
    });

    it("should return false for table format", () => {
      expect(new OutputFormatter("table").isJson()).toBe(false);
    });
  });

  describe("outputList()", () => {
    const data = [
      { id: 1, name: "alpha", status: "active" },
      { id: 2, name: "beta", status: "inactive" },
    ];

    it("should output JSON array in json format", () => {
      const formatter = new OutputFormatter("json");
      formatter.outputList(data, ["id", "name", "status"], "No items.");
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
    });

    it("should output a table in table format", () => {
      const formatter = new OutputFormatter("table");
      formatter.outputList(data, ["id", "name"], "No items.");
      const calls = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      expect(calls.some((c) => c.includes("name"))).toBe(true);
      expect(calls.some((c) => c.includes("alpha"))).toBe(true);
    });

    it("should show empty message in human format when no items", () => {
      const formatter = new OutputFormatter("human");
      formatter.outputList([], ["id", "name"], "No items found.");
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("No items found."));
    });

    it("should render padded columns in human format", () => {
      const formatter = new OutputFormatter("human");
      formatter.outputList(data, ["id", "name", "status"], "No items.");
      const calls = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      expect(calls.some((c) => c.includes("alpha"))).toBe(true);
      expect(calls.some((c) => c.includes("beta"))).toBe(true);
    });

    it("should use custom lineFormat when provided", () => {
      const formatter = new OutputFormatter("human");
      formatter.outputList(data, ["id", "name"], "No items.", (item) => `custom:${item.name}`);
      const calls = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      expect(calls.some((c) => c.startsWith("custom:alpha"))).toBe(true);
    });

    it("should render default padded columns when no lineFormat", () => {
      const formatter = new OutputFormatter("human");
      formatter.outputList(data, ["id", "name", "status"], "No items.");
      const calls = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      // Should have two rows with id and name padded
      expect(calls).toHaveLength(2);
      expect(calls[0]).toContain("alpha");
      expect(calls[1]).toContain("beta");
    });

    it("should handle null/undefined values in default columns", () => {
      const formatter = new OutputFormatter("human");
      const withNull = [
        { id: 1, name: null as unknown as string, status: undefined as unknown as string },
      ];
      formatter.outputList(withNull, ["id", "name", "status"], "No items.");
      const calls = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      expect(calls).toHaveLength(1);
    });
  });

  describe("outputOne()", () => {
    const item = { id: 1, name: "my-server", status: "active" };

    it("should output JSON in json format", () => {
      const formatter = new OutputFormatter("json");
      formatter.outputOne(item);
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(item, null, 2));
    });

    it("should output key/value table in table format", () => {
      const formatter = new OutputFormatter("table");
      formatter.outputOne(item, ["id", "name"]);
      const calls = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      expect(calls.some((c) => c.includes("field"))).toBe(true);
      expect(calls.some((c) => c.includes("name"))).toBe(true);
    });

    it("should output key: value lines in human format", () => {
      const formatter = new OutputFormatter("human");
      formatter.outputOne(item, ["id", "name", "status"]);
      const calls = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      expect(calls.some((c) => c.includes("my-server"))).toBe(true);
      expect(calls.some((c) => c.includes("active"))).toBe(true);
    });

    it("should serialize object values as JSON in human format", () => {
      const formatter = new OutputFormatter("human");
      formatter.outputOne({ id: 1, tags: [{ name: "web" }] }, ["id", "tags"]);
      const calls = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      expect(calls.some((c) => c.includes("[{"))).toBe(true);
    });

    it("should stringify null values as empty string in human format", () => {
      const formatter = new OutputFormatter("human");
      formatter.outputOne({ id: 1, name: null as unknown as string }, ["id", "name"]);
      const calls = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      expect(calls).toHaveLength(2);
      // null → String(null ?? "") → ""
      expect(calls[1]).not.toContain("null");
    });

    it("should use all keys when fields not specified", () => {
      const formatter = new OutputFormatter("human");
      formatter.outputOne(item);
      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });
  });
});
