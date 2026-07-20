import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleSshCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  sshConnect: vi.fn().mockResolvedValue(),
}));

const fakeCtx = { formatter: {}, options: {} };
vi.mock("../../context.ts", () => ({
  createContext: vi.fn(() => fakeCtx),
}));

describe("handleSshCommand", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a context and delegates to sshConnect", async () => {
    const { sshConnect } = await import("./handlers.ts");
    const { createContext } = await import("../../context.ts");

    await handleSshCommand("my-server", ["uptime"], { format: "human" });

    expect(createContext).toHaveBeenCalledWith({ format: "human" });
    expect(sshConnect).toHaveBeenCalledWith("my-server", ["uptime"], fakeCtx);
  });

  it("passes an undefined server through", async () => {
    const { sshConnect } = await import("./handlers.ts");
    await handleSshCommand(undefined, [], {});
    expect(sshConnect).toHaveBeenCalledWith(undefined, [], fakeCtx);
  });
});
