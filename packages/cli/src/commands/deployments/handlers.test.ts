import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { DeploymentAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { deploymentsList, deploymentsDeploy } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listDeployments: vi.fn(),
  deploySiteAndWait: vi.fn(),
}));

const mockDeployment: DeploymentAttributes & { id: number } = {
  id: 1,
  commit: {
    hash: "abc123",
    author: "John",
    message: "Deploy",
    branch: "main",
  },
  status: "finished",
  type: "push",
  started_at: "2024-01-01T00:00:00Z",
  ended_at: "2024-01-01T00:01:00Z",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
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
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
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

  it("should stream logs via onLog when --stream flag is set", async () => {
    const { deploySiteAndWait } = await import("@studiometa/forge-core");
    vi.mocked(deploySiteAndWait).mockImplementation(async (opts) => {
      // Verify onLog is provided and onProgress is not when streaming
      expect(opts.onLog).toBeDefined();
      expect(opts.onProgress).toBeUndefined();
      if (opts.onLog) {
        opts.onLog("Step 1\n");
        opts.onLog("Step 2\n");
      }
      return { data: { status: "success", log: "Step 1\nStep 2\n", elapsed_ms: 3000 } };
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", stream: true },
    });

    await deploymentsDeploy(ctx);
    expect(stdoutSpy).toHaveBeenCalledWith("Step 1\n");
    expect(stdoutSpy).toHaveBeenCalledWith("Step 2\n");
  });

  it("should use onProgress when --stream flag is not set", async () => {
    const { deploySiteAndWait } = await import("@studiometa/forge-core");
    vi.mocked(deploySiteAndWait).mockImplementation(async (opts) => {
      // Verify onProgress is provided and onLog is not when not streaming
      expect(opts.onProgress).toBeDefined();
      expect(opts.onLog).toBeUndefined();
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

  it("should not output full log when --stream flag is set", async () => {
    const { deploySiteAndWait } = await import("@studiometa/forge-core");
    vi.mocked(deploySiteAndWait).mockResolvedValue({
      data: { status: "success", log: "Full log content", elapsed_ms: 3000 },
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", stream: true },
    });

    await deploymentsDeploy(ctx);
    // Should show success message but NOT the full log (since it was streamed)
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("succeeded"));
    expect(vi.mocked(console.log)).not.toHaveBeenCalledWith(
      expect.stringContaining("Full log content"),
    );
  });
});

describe("deploymentsList — human format lineFormat", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("should render human format with commit hash", async () => {
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

  it("should render '—' when commit hash is null", async () => {
    const { listDeployments } = await import("@studiometa/forge-core");
    vi.mocked(listDeployments).mockResolvedValue({
      data: [
        { ...mockDeployment, commit: { hash: null, author: null, message: null, branch: null } },
      ],
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
