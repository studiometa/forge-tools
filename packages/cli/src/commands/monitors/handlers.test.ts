import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeMonitor } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { monitorsList, monitorsGet, monitorsCreate, monitorsDelete } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listMonitors: vi.fn(),
  getMonitor: vi.fn(),
  createMonitor: vi.fn(),
  deleteMonitor: vi.fn(),
}));

const mockMonitor: ForgeMonitor = {
  id: 1,
  server_id: 10,
  type: "cpu_load",
  operator: ">=",
  threshold: 80,
  minutes: 5,
  state: "OK",
  state_changed_at: "2024-01-01T00:00:00Z",
};

describe("monitorsList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list monitors", async () => {
    const { listMonitors } = await import("@studiometa/forge-core");
    vi.mocked(listMonitors).mockResolvedValue({ data: [mockMonitor] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await monitorsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"cpu_load"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await monitorsList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("monitorsGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get monitor by id", async () => {
    const { getMonitor } = await import("@studiometa/forge-core");
    vi.mocked(getMonitor).mockResolvedValue({ data: mockMonitor });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await monitorsGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"cpu_load"'));
  });

  it("should exit with error when no monitor_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await monitorsGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await monitorsGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("monitorsCreate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a monitor", async () => {
    const { createMonitor } = await import("@studiometa/forge-core");
    vi.mocked(createMonitor).mockResolvedValue({ data: mockMonitor });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        type: "cpu_load",
        operator: ">=",
        threshold: "80",
        minutes: "5",
      },
    });

    await monitorsCreate(ctx);
    expect(vi.mocked(createMonitor)).toHaveBeenCalledWith(
      expect.objectContaining({ type: "cpu_load", operator: ">=" }),
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", type: "cpu_load", operator: ">=", threshold: "80", minutes: "5" },
    });

    await monitorsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no type", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", operator: ">=", threshold: "80", minutes: "5" },
    });

    await monitorsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no operator", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", type: "cpu_load", threshold: "80", minutes: "5" },
    });

    await monitorsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("monitorsDelete", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delete a monitor", async () => {
    const { deleteMonitor } = await import("@studiometa/forge-core");
    vi.mocked(deleteMonitor).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await monitorsDelete(["1"], ctx);
    expect(vi.mocked(deleteMonitor)).toHaveBeenCalledWith(
      { server_id: "10", id: "1" },
      expect.anything(),
    );
  });

  it("should exit with error when no monitor_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await monitorsDelete([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await monitorsDelete(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("monitorsCreate — default threshold/minutes to 0", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should default threshold and minutes to 0 when not provided", async () => {
    const { createMonitor } = await import("@studiometa/forge-core");
    vi.mocked(createMonitor).mockResolvedValue({ data: mockMonitor });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", type: "cpu_load", operator: ">=" },
    });
    await monitorsCreate(ctx);
    expect(vi.mocked(createMonitor)).toHaveBeenCalledWith(
      expect.objectContaining({ threshold: 0, minutes: 0 }),
      expect.anything(),
    );
  });
});

describe("monitorsList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with lineFormat callback", async () => {
    const { listMonitors } = await import("@studiometa/forge-core");
    vi.mocked(listMonitors).mockResolvedValue({ data: [mockMonitor] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10" },
    });
    await monitorsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});
