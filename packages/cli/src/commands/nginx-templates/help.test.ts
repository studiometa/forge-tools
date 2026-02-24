import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showNginxTemplatesHelp } from "./help.ts";

describe("showNginxTemplatesHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show general help", () => {
    showNginxTemplatesHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("nginx-templates"));
  });

  it("should show list help", () => {
    showNginxTemplatesHelp("list");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("nginx-templates list"));
  });

  it("should show list help for ls", () => {
    showNginxTemplatesHelp("ls");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("nginx-templates list"));
  });

  it("should show get help", () => {
    showNginxTemplatesHelp("get");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("template_id"));
  });

  it("should show create help", () => {
    showNginxTemplatesHelp("create");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("nginx-templates create"));
  });

  it("should show update help", () => {
    showNginxTemplatesHelp("update");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("nginx-templates update"));
  });

  it("should show delete help", () => {
    showNginxTemplatesHelp("delete");
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("nginx-templates delete"));
  });
});
