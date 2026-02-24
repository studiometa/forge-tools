import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeDaemon } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { daemonsList, daemonsGet, daemonsRestart } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listDaemons: vi.fn(),
  getDaemon: vi.fn(),
  restartDaemon: vi.fn(),
}));

const mockDaemon: ForgeDaemon = {
  id: 1,
  server_id: 10,
  command: "php artisan queue:work",
  user: "forge",
  directory: null,
  processes: 1,
  startsecs: 1,
  stopsignal: "TERM",
  stopwaitsecs: 10,
  status: "running",
  created_at: "2024-01-01T00:00:00Z",
};

describe("daemonsList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list daemons", async () => {
    const { listDaemons } = await import("@studiometa/forge-core");
    vi.mocked(listDaemons).mockResolvedValue({ data: [mockDaemon] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await daemonsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"running"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await daemonsList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("daemonsGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get daemon by id", async () => {
    const { getDaemon } = await import("@studiometa/forge-core");
    vi.mocked(getDaemon).mockResolvedValue({ data: mockDaemon });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await daemonsGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"running"'));
  });

  it("should exit with error when no daemon_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await daemonsGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await daemonsGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("daemonsRestart", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should restart daemon", async () => {
    const { restartDaemon } = await import("@studiometa/forge-core");
    vi.mocked(restartDaemon).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10" },
    });

    await daemonsRestart(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("restarted"));
  });

  it("should exit with error when no daemon_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await daemonsRestart([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await daemonsRestart(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});
