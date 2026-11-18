import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleNetworkCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  networkGet: vi.fn().mockResolvedValue(),
  networkUpdate: vi.fn().mockResolvedValue(),
}));

describe("handleNetworkCommand routing", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route get and update", async () => {
    const h = await import("./handlers.ts");
    await handleNetworkCommand("get", [], { server: "1" });
    await handleNetworkCommand("update", [], { server: "1", servers: "2" });
    expect(h.networkGet).toHaveBeenCalled();
    expect(h.networkUpdate).toHaveBeenCalled();
  });
});
