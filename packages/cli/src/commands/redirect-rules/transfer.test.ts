import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { readFileSync, writeFileSync } from "node:fs";

import { createTestContext } from "../../context.ts";
import { redirectRulesExport, redirectRulesImport, redirectRulesReorder } from "./handlers.ts";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock("@studiometa/forge-core", () => ({
  exportRedirectRules: vi.fn(),
  importRedirectRules: vi.fn(),
  reorderRedirectRules: vi.fn(),
}));

const CSV = "from,to,type\n/a,/b,redirect\n";
const site = { server: "1", site: "2" };

function context(options: Record<string, unknown>) {
  return createTestContext({ token: "test", mockClient: {} as never, options });
}

let exit: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  exit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("redirectRulesExport", () => {
  it("should print the CSV", async () => {
    const { exportRedirectRules } = await import("@studiometa/forge-core");
    vi.mocked(exportRedirectRules).mockResolvedValue({ data: CSV });
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    await redirectRulesExport(context({ format: "human", ...site }));

    expect(exportRedirectRules).toHaveBeenCalledWith(
      { server_id: "1", site_id: "2" },
      expect.anything(),
    );
    expect(write).toHaveBeenCalledWith(CSV);
  });

  it("should write the CSV to --output", async () => {
    const { exportRedirectRules } = await import("@studiometa/forge-core");
    vi.mocked(exportRedirectRules).mockResolvedValue({ data: CSV });

    await redirectRulesExport(context({ format: "human", ...site, output: "redirects.csv" }));

    expect(writeFileSync).toHaveBeenCalledWith("redirects.csv", CSV);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("redirects.csv"));
  });
});

describe("redirectRulesImport", () => {
  it("should import the CSV file, appending by default", async () => {
    const { importRedirectRules } = await import("@studiometa/forge-core");
    vi.mocked(importRedirectRules).mockResolvedValue({ data: { imported: 1 } });
    vi.mocked(readFileSync).mockReturnValue(CSV);

    await redirectRulesImport(context({ format: "human", ...site, file: "redirects.csv" }));

    expect(readFileSync).toHaveBeenCalledWith("redirects.csv", "utf8");
    expect(importRedirectRules).toHaveBeenCalledWith(
      { server_id: "1", site_id: "2", csv: CSV, mode: "append" },
      expect.anything(),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("1 redirect rule(s) imported."),
    );
  });

  it("should replace the rules with --mode replace", async () => {
    const { importRedirectRules } = await import("@studiometa/forge-core");
    vi.mocked(importRedirectRules).mockResolvedValue({ data: { imported: 1 } });
    vi.mocked(readFileSync).mockReturnValue(CSV);

    await redirectRulesImport(
      context({ format: "json", ...site, file: "redirects.csv", mode: "replace" }),
    );

    expect(vi.mocked(importRedirectRules).mock.lastCall?.[0].mode).toBe("replace");
  });

  it("should refuse an unknown mode", async () => {
    await redirectRulesImport(
      context({ format: "json", ...site, file: "redirects.csv", mode: "merge" }),
    ).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
  });
});

describe("redirectRulesReorder", () => {
  it("should send the rule IDs in order", async () => {
    const { reorderRedirectRules } = await import("@studiometa/forge-core");
    vi.mocked(reorderRedirectRules).mockResolvedValue({ data: undefined });

    await redirectRulesReorder(context({ format: "human", ...site, ids: "3, 1,2" }));

    expect(reorderRedirectRules).toHaveBeenCalledWith(
      { server_id: "1", site_id: "2", redirects: [3, 1, 2] },
      expect.anything(),
    );
  });

  it.each([{}, { ids: "" }, { ids: "a,b" }])("should refuse invalid --ids %o", async (ids) => {
    await redirectRulesReorder(context({ format: "json", ...site, ...ids })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
  });
});
