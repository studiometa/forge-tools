import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showSshKeysHelp } from "./help.ts";

describe("showSshKeysHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showSshKeysHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("ssh-keys"));
  });

  it("should show list help", () => {
    showSshKeysHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("ssh-keys list"));
  });

  it("should show list help for ls", () => {
    showSshKeysHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("ssh-keys list"));
  });

  it("should show get help", () => {
    showSshKeysHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("key_id"));
  });

  it("should show sync help", () => {
    showSshKeysHelp("sync");
    const text = String(consoleLogSpy.mock.calls[0][0]);
    expect(text).toContain("ssh-keys sync");
    expect(text).toContain("--all-servers");
    expect(text).toContain("--prune");
    expect(text).toContain("--dry-run");
  });

  it("should list sync in general help", () => {
    showSshKeysHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("sync"));
  });
});
