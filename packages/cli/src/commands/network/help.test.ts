import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showNetworkHelp } from "./help.ts";

describe("showNetworkHelp", () => {
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [undefined, "forge network"],
    ["get", "forge network get"],
    ["update", "forge network update"],
  ])("should show the help of %s", (subcommand, text) => {
    showNetworkHelp(subcommand);
    expect(log).toHaveBeenCalledWith(expect.stringContaining(text));
  });
});
