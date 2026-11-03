import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showStorageProvidersHelp } from "./help.ts";

describe("showStorageProvidersHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [undefined, "SUBCOMMANDS"],
    ["list", "storage-providers list"],
    ["ls", "storage-providers list"],
    ["get", "never returns"],
    ["create", "--secret-key-file"],
    ["delete", "storage-providers delete"],
  ])("should show help for %s", (subcommand, text) => {
    showStorageProvidersHelp(subcommand);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(text));
  });
});
