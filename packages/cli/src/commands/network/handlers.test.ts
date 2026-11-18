import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createTestContext } from "../../context.ts";
import { networkGet, networkUpdate } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  getServerNetwork: vi.fn(),
  updateServerNetwork: vi.fn(),
}));

function context(options: Record<string, unknown>) {
  return createTestContext({ token: "test", mockClient: {} as never, options });
}

let exit: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  exit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("networkGet", () => {
  it("should list the servers in the network", async () => {
    const { getServerNetwork } = await import("@studiometa/forge-core");
    vi.mocked(getServerNetwork).mockResolvedValue({
      data: [
        { id: 2, name: "db-1", private_ip_address: "10.0.0.2" },
        { id: 3, name: "cache-1", private_ip_address: null },
      ] as never,
    });

    await networkGet(context({ format: "human", server: "1" }));

    expect(getServerNetwork).toHaveBeenCalledWith({ server_id: "1" }, expect.anything());
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("10.0.0.2"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("—"));
  });

  it("should require the server", async () => {
    await networkGet(context({ format: "json" })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
  });
});

describe("networkUpdate", () => {
  it("should send the server IDs", async () => {
    const { updateServerNetwork } = await import("@studiometa/forge-core");
    vi.mocked(updateServerNetwork).mockResolvedValue({ data: undefined });

    await networkUpdate(context({ format: "human", server: "1", servers: "2, 3," }));

    expect(updateServerNetwork).toHaveBeenCalledWith(
      { server_id: "1", servers: [2, 3] },
      expect.anything(),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Network of server 1 updated."),
    );
  });

  it("should require the server and the servers", async () => {
    await networkUpdate(context({ format: "json", servers: "2" })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
    exit.mockClear();
    await networkUpdate(context({ format: "json", server: "1" })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
  });
});
