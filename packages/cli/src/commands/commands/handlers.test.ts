import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeCommand } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { commandsList, commandsGet, commandsCreate } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listCommands: vi.fn(),
  getCommand: vi.fn(),
  createCommand: vi.fn(),
}));

const mockCommand: ForgeCommand = {
  id: 1,
  server_id: 10,
  site_id: 20,
  user_id: 5,
  event_id: 100,
  command: "php artisan migrate",
  status: "finished",
  created_at: "2024-01-01T00:00:00Z",
  profile_photo_url: "",
  user_name: "forge",
};

describe("commandsList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list commands", async () => {
    const { listCommands } = await import("@studiometa/forge-core");
    vi.mocked(listCommands).mockResolvedValue({ data: [mockCommand] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await commandsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining('"php artisan migrate"'),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20" },
    });

    await commandsList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await commandsList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("commandsGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get command by id", async () => {
    const { getCommand } = await import("@studiometa/forge-core");
    vi.mocked(getCommand).mockResolvedValue({ data: mockCommand });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await commandsGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining('"php artisan migrate"'),
    );
  });

  it("should exit with error when no command_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await commandsGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20" },
    });

    await commandsGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await commandsGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("commandsCreate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a command", async () => {
    const { createCommand } = await import("@studiometa/forge-core");
    vi.mocked(createCommand).mockResolvedValue({ data: mockCommand });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: {
        format: "json",
        server: "10",
        site: "20",
        command: "php artisan migrate",
      },
    });

    await commandsCreate(ctx);
    expect(vi.mocked(createCommand)).toHaveBeenCalledWith(
      expect.objectContaining({ command: "php artisan migrate" }),
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "20", command: "php artisan migrate" },
    });

    await commandsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", command: "php artisan migrate" },
    });

    await commandsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no command", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "20" },
    });

    await commandsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("commandsList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with lineFormat callback", async () => {
    const { listCommands } = await import("@studiometa/forge-core");
    vi.mocked(listCommands).mockResolvedValue({ data: [mockCommand] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });
    await commandsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});
