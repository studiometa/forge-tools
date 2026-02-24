import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeUser } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { userGet } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  getUser: vi.fn(),
}));

const mockUser: ForgeUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  card_last_four: "4242",
  connected_to_github: true,
  connected_to_gitlab: false,
  connected_to_bitbucket: false,
  connected_to_bitbucket_two: false,
  connected_to_digitalocean: false,
  connected_to_linode: false,
  connected_to_vultr: false,
  connected_to_aws: false,
  connected_to_hetzner: false,
  ready_for_billing: true,
  stripe_is_active: true,
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
