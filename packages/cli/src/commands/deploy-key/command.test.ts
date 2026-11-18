import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleDeployKeyCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  deployKeyGet: vi.fn().mockResolvedValue(),
  deployKeyCreate: vi.fn().mockResolvedValue(),
  deployKeyDelete: vi.fn().mockResolvedValue(),
}));

describe("handleDeployKeyCommand routing", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route get, create and delete", async () => {
    const h = await import("./handlers.ts");
    for (const sub of ["get", "create", "delete"]) {
      await handleDeployKeyCommand(sub, [], { server: "1", site: "2" });
    }
    expect(h.deployKeyGet).toHaveBeenCalled();
    expect(h.deployKeyCreate).toHaveBeenCalled();
    expect(h.deployKeyDelete).toHaveBeenCalled();
  });
});
