import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeScheduledJob } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import {
  scheduledJobsList,
  scheduledJobsGet,
  scheduledJobsCreate,
  scheduledJobsDelete,
} from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listScheduledJobs: vi.fn(),
  getScheduledJob: vi.fn(),
  createScheduledJob: vi.fn(),
  deleteScheduledJob: vi.fn(),
}));

const mockJob: ForgeScheduledJob = {
  id: 1,
  server_id: 10,
  command: "php artisan schedule:run",
  user: "forge",
  frequency: "minutely",
  cron: "* * * * *",
  status: "active",
  created_at: "2024-01-01T00:00:00Z",
};

describe("scheduledJobsList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list scheduled jobs", async () => {
    const { listScheduledJobs } = await import("@studiometa/forge-core");
    vi.mocked(listScheduledJobs).mockResolvedValue({ data: [mockJob] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await scheduledJobsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining('"php artisan schedule:run"'),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await scheduledJobsList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("scheduledJobsGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get scheduled job by id", async () => {
    const { getScheduledJob } = await import("@studiometa/forge-core");
    vi.mocked(getScheduledJob).mockResolvedValue({ data: mockJob });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await scheduledJobsGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining('"php artisan schedule:run"'),
    );
  });

  it("should exit with error when no job_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await scheduledJobsGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await scheduledJobsGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("scheduledJobsCreate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a scheduled job", async () => {
    const { createScheduledJob } = await import("@studiometa/forge-core");
    vi.mocked(createScheduledJob).mockResolvedValue({ data: mockJob });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", command: "php artisan schedule:run" },
    });

    await scheduledJobsCreate(ctx);
    expect(vi.mocked(createScheduledJob)).toHaveBeenCalledWith(
      expect.objectContaining({ command: "php artisan schedule:run" }),
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", command: "php artisan schedule:run" },
    });

    await scheduledJobsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no command", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await scheduledJobsCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("scheduledJobsDelete", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delete a scheduled job", async () => {
    const { deleteScheduledJob } = await import("@studiometa/forge-core");
    vi.mocked(deleteScheduledJob).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await scheduledJobsDelete(["1"], ctx);
    expect(vi.mocked(deleteScheduledJob)).toHaveBeenCalledWith(
      { server_id: "10", id: "1" },
      expect.anything(),
    );
  });

  it("should exit with error when no job_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await scheduledJobsDelete([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await scheduledJobsDelete(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("scheduledJobsList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with lineFormat callback", async () => {
    const { listScheduledJobs } = await import("@studiometa/forge-core");
    vi.mocked(listScheduledJobs).mockResolvedValue({ data: [mockJob] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10" },
    });
    await scheduledJobsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});
