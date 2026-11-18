import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { showDeployKeyHelp } from "./help.ts";

describe("showDeployKeyHelp", () => {
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [undefined, "forge deploy-key"],
    ["get", "forge deploy-key get"],
    ["create", "forge deploy-key create"],
    ["delete", "forge deploy-key delete"],
  ])("should show the help of %s", (subcommand, text) => {
    showDeployKeyHelp(subcommand);
    expect(log).toHaveBeenCalledWith(expect.stringContaining(text));
  });
});
