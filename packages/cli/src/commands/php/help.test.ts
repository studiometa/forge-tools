import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { showPhpHelp } from "./help.ts";

describe("showPhpHelp", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function output(subcommand?: string): string {
    showPhpHelp(subcommand);
    return String(logSpy.mock.calls.at(-1)?.[0]);
  }

  it("should show the overview with every subcommand", () => {
    const text = output();
    for (const subcommand of [
      "list, ls",
      "config",
      "update-config",
      "set-max-upload-size",
      "set-max-execution-time",
      "enable-opcache",
      "disable-opcache",
    ]) {
      expect(text).toContain(subcommand);
    }
  });

  it.each(["list", "ls"])("should show list help for %s", (subcommand) => {
    expect(output(subcommand)).toContain("forge php list --server <server_id>");
  });

  it("should show config help", () => {
    const text = output("config");
    expect(text).toContain("--type <cli|fpm|pool>");
    expect(text).toContain("--user <name>");
  });

  it("should show update-config help with --file and --check", () => {
    const text = output("update-config");
    expect(text).toContain("--file <path>");
    expect(text).toContain("--check");
  });

  it.each([
    "max-upload-size",
    "set-max-upload-size",
    "max-execution-time",
    "set-max-execution-time",
  ])("should show limits help for %s", (subcommand) => {
    expect(output(subcommand)).toContain("forge php set-max-upload-size <megabytes>");
  });

  it.each(["opcache", "enable-opcache", "disable-opcache"])(
    "should show OPcache help for %s",
    (subcommand) => {
      expect(output(subcommand)).toContain("forge php enable-opcache --server <server_id>");
    },
  );
});
