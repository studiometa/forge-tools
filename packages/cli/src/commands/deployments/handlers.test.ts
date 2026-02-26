import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeDeployment } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { deploymentsList, deploymentsDeploy } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listDeployments: vi.fn(),
  deploySiteAndWait: vi.fn(),
}));

const mockDeployment: ForgeDeployment = {
  id: 1,
  server_id: 10,
  site_id: 100,
  type: 1,
  commit_hash: "abc123",
  commit_author: "John",
  commit_message: "Deploy",
  started_at: "2024-01-01T00:00:00Z",
  ended_at: "2024-01-01T00:01:00Z",
  status: "finished",
  displayable_type: "push",
};

describe("deploymentsList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list deployments", async () => {
    const { listDeployments } = await import("@studiometa/forge-core");
    vi.mocked(listDeployments).mockResolvedValue({ data: [mockDeployment] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100" },
    });

    await deploymentsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"finished"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100" },
    });

    await deploymentsList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await deploymentsList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("deploymentsDeploy", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should trigger deployment and display success result", async () => {
    const { deploySiteAndWait } = await import("@studiometa/forge-core");
    vi.mocked(deploySiteAndWait).mockResolvedValue({
      data: { status: "success", log: "Build succeeded.", elapsed_ms: 3000 },
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsDeploy(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("succeeded"));
  });

  it("should display deployment log after success", async () => {
    const { deploySiteAndWait } = await import("@studiometa/forge-core");
    vi.mocked(deploySiteAndWait).mockResolvedValue({
      data: { status: "success", log: "Build succeeded.\nDone.", elapsed_ms: 5000 },
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsDeploy(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("Build succeeded."),
    );
  });

  it("should display failed status when deployment fails", async () => {
    const { deploySiteAndWait } = await import("@studiometa/forge-core");
    vi.mocked(deploySiteAndWait).mockResolvedValue({
      data: { status: "failed", log: "Error: npm install failed.", elapsed_ms: 2000 },
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsDeploy(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("failed"));
  });

  it("should call onProgress during polling", async () => {
    const { deploySiteAndWait } = await import("@studiometa/forge-core");
    // Capture the onProgress callback and call it
    vi.mocked(deploySiteAndWait).mockImplementation(async (opts) => {
      if (opts.onProgress) {
        opts.onProgress({ status: "deploying", elapsed_ms: 1000 });
      }
      return { data: { status: "success", log: "Done.", elapsed_ms: 3000 } };
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsDeploy(ctx);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("deploying"));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100" },
    });

    await deploymentsDeploy(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await deploymentsDeploy(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("deploymentsList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with commit_hash", async () => {
    const { listDeployments } = await import("@studiometa/forge-core");
    vi.mocked(listDeployments).mockResolvedValue({ data: [mockDeployment] });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });
    await deploymentsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });

  it("should render '—' when commit_hash is null", async () => {
    const { listDeployments } = await import("@studiometa/forge-core");
    vi.mocked(listDeployments).mockResolvedValue({
      data: [{ ...mockDeployment, commit_hash: null }],
    });
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });
    await deploymentsList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });
});
