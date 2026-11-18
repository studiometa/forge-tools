import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleGitCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  gitUpdate: vi.fn().mockResolvedValue(),
}));

describe("handleGitCommand routing", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route update", async () => {
    const h = await import("./handlers.ts");
    await handleGitCommand("update", [], { server: "1", site: "2" });
    expect(h.gitUpdate).toHaveBeenCalled();
  });
});
