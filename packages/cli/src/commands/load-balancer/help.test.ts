import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { showLoadBalancerHelp } from "./help.ts";

describe("showLoadBalancerHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows general help when no subcommand", () => {
    showLoadBalancerHelp();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("forge load-balancer"));
  });

  it("shows apply help", () => {
    showLoadBalancerHelp("apply");
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("forge load-balancer apply --file"),
    );
  });
});
