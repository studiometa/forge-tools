import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { UserAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { userGet } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  getUser: vi.fn(),
}));

const mockUser: UserAttributes & { id: number } = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("userGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get the authenticated user", async () => {
    const { getUser } = await import("@studiometa/forge-core");
    vi.mocked(getUser).mockResolvedValue({ data: mockUser });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await userGet(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"Test User"'));
  });

  it("should not exit on successful call", async () => {
    const { getUser } = await import("@studiometa/forge-core");
    vi.mocked(getUser).mockResolvedValue({ data: mockUser });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await userGet(ctx);
    expect(processExitSpy).not.toHaveBeenCalled();
  });
});
