import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showEventsHelp } from "./help.ts";

describe("showEventsHelp", () => {
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [undefined, "forge events"],
    ["list", "forge events list"],
    ["ls", "forge events list"],
    ["get", "forge events get"],
    ["output", "forge events output"],
  ])("should show the help of %s", (subcommand, text) => {
    showEventsHelp(subcommand);
    expect(log).toHaveBeenCalledWith(expect.stringContaining(text));
  });
});
