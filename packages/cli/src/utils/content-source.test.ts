import { readFileSync } from "node:fs";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { OutputFormatter } from "../output.ts";
import { readContentFile, readContentOption } from "./content-source.ts";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

const source = {
  label: "deployment script",
  usage: "forge deployments update-script --file <path>",
  formatter: new OutputFormatter("human", true),
};

describe("content-source", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Throw on exit so the code after a failed check never runs, as in production.
    processExitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`exit ${code}`);
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("readContentFile", () => {
    it("should read a file as UTF-8", () => {
      vi.mocked(readFileSync).mockReturnValue("npm ci\n");
      expect(readContentFile("deploy.sh", "file", source)).toBe("npm ci\n");
      expect(readFileSync).toHaveBeenCalledWith("deploy.sh", "utf8");
    });

    it("should read stdin when the path is -", () => {
      vi.mocked(readFileSync).mockReturnValue("from stdin");
      expect(readContentFile("-", "file", source)).toBe("from stdin");
      expect(readFileSync).toHaveBeenCalledWith(0, "utf8");
    });

    it.each([true, "", undefined])("should exit 3 when the path is %s", (path) => {
      expect(() => readContentFile(path, "script-file", source)).toThrow("exit 3");
      expect(processExitSpy).toHaveBeenCalledWith(3);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("--script-file requires a path (use - for stdin)"),
      );
      expect(readFileSync).not.toHaveBeenCalled();
    });

    it("should exit 3 when the file cannot be read", () => {
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error("ENOENT: no such file or directory");
      });
      expect(() => readContentFile("missing.sh", "file", source)).toThrow("exit 3");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Cannot read deployment script from missing.sh: ENOENT"),
      );
    });

    it("should report a non-Error value thrown while reading", () => {
      vi.mocked(readFileSync).mockImplementation(() => {
        // oxlint-disable-next-line no-throw-literal
        throw "boom";
      });
      expect(() => readContentFile("missing.sh", "file", source)).toThrow("exit 3");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Cannot read deployment script from missing.sh: boom"),
      );
    });

    it("should exit 3 when the file is empty", () => {
      vi.mocked(readFileSync).mockReturnValue(" \n");
      expect(() => readContentFile("empty.sh", "file", source)).toThrow("exit 3");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Deployment script is empty"),
      );
    });
  });

  describe("readContentOption", () => {
    it("should return --content", () => {
      expect(readContentOption({ content: "npm ci" }, source)).toBe("npm ci");
      expect(readFileSync).not.toHaveBeenCalled();
    });

    it("should read --file", () => {
      vi.mocked(readFileSync).mockReturnValue("npm run build");
      expect(readContentOption({ file: "deploy.sh" }, source)).toBe("npm run build");
    });

    it("should exit 3 when both --file and --content are given", () => {
      expect(() => readContentOption({ file: "a.sh", content: "npm ci" }, source)).toThrow(
        "exit 3",
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Use either --file or --content, not both"),
      );
      expect(readFileSync).not.toHaveBeenCalled();
    });

    it("should exit 3 when no source is given", () => {
      expect(() => readContentOption({}, source)).toThrow("exit 3");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Missing deployment script: use --file or --content"),
      );
    });

    it("should exit 3 when --content is blank", () => {
      expect(() => readContentOption({ content: "  \n" }, source)).toThrow("exit 3");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Deployment script is empty"),
      );
    });

    it("should exit 3 when --content has no value", () => {
      expect(() => readContentOption({ content: true }, source)).toThrow("exit 3");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Deployment script is empty"),
      );
    });
  });
});
