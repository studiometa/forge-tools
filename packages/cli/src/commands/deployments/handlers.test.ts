import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { DeploymentAttributes } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import {
  deploymentsList,
  deploymentsDeploy,
  deploymentsLogs,
  deploymentsScript,
  deploymentsUpdateScript,
} from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listDeployments: vi.fn(),
  deploySiteAndWait: vi.fn(),
  getDeploymentLog: vi.fn(),
  getDeploymentScript: vi.fn(),
  updateDeploymentScript: vi.fn(),
}));

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
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

describe("deploymentsLogs", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show log for an explicit deployment id", async () => {
    const { getDeploymentLog, listDeployments } = await import("@studiometa/forge-core");
    vi.mocked(getDeploymentLog).mockResolvedValue({ data: "Build succeeded." });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsLogs(["42"], ctx);
    expect(vi.mocked(listDeployments)).not.toHaveBeenCalled();
    expect(vi.mocked(getDeploymentLog)).toHaveBeenCalledWith(
      expect.objectContaining({ deployment_id: "42" }),
      expect.anything(),
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("Build succeeded."),
    );
  });

  it("should default to the latest deployment when no id is given", async () => {
    const { getDeploymentLog, listDeployments } = await import("@studiometa/forge-core");
    vi.mocked(listDeployments).mockResolvedValue({ data: [mockDeployment] });
    vi.mocked(getDeploymentLog).mockResolvedValue({ data: "Latest log." });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsLogs([], ctx);
    expect(vi.mocked(getDeploymentLog)).toHaveBeenCalledWith(
      expect.objectContaining({ deployment_id: "1" }),
      expect.anything(),
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining("Latest log."));
  });

  it("should show a clean message when there are no deployments", async () => {
    const { getDeploymentLog, listDeployments } = await import("@studiometa/forge-core");
    vi.mocked(listDeployments).mockResolvedValue({ data: [] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsLogs([], ctx);
    expect(vi.mocked(getDeploymentLog)).not.toHaveBeenCalled();
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("No deployments found."),
    );
  });

  it("should show info message when log output is empty", async () => {
    const { getDeploymentLog } = await import("@studiometa/forge-core");
    vi.mocked(getDeploymentLog).mockResolvedValue({ data: "" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsLogs(["42"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("No log output available."),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100" },
    });

    await deploymentsLogs([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await deploymentsLogs([], ctx).catch(() => {});
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

  it("should display failed status and exit non-zero when deployment fails", async () => {
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
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(expect.stringContaining("failed"));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should output the log before failing when deployment fails without streaming", async () => {
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
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("Error: npm install failed."),
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
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
    // Separator newline so the final status message is not on the last log line.
    expect(stdoutSpy).toHaveBeenLastCalledWith("\n");
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

describe("deploymentsScript", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should print the raw script in human format", async () => {
    const { getDeploymentScript } = await import("@studiometa/forge-core");
    vi.mocked(getDeploymentScript).mockResolvedValue({ data: "cd /home/forge\nnpm ci" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsScript(ctx);
    expect(vi.mocked(getDeploymentScript)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100" },
      expect.anything(),
    );
    expect(stdoutSpy).toHaveBeenCalledWith("cd /home/forge\nnpm ci\n");
  });

  it("should not add a newline when the script already ends with one", async () => {
    const { getDeploymentScript } = await import("@studiometa/forge-core");
    vi.mocked(getDeploymentScript).mockResolvedValue({ data: "npm ci\n" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsScript(ctx);
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy).toHaveBeenCalledWith("npm ci\n");
  });

  it("should print { content } in json format", async () => {
    const { getDeploymentScript } = await import("@studiometa/forge-core");
    vi.mocked(getDeploymentScript).mockResolvedValue({ data: "npm ci" });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100" },
    });

    await deploymentsScript(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(JSON.stringify({ content: "npm ci" }));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100" },
    });

    await deploymentsScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await deploymentsScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("deploymentsUpdateScript", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should update the script from --content", async () => {
    const { updateDeploymentScript } = await import("@studiometa/forge-core");
    vi.mocked(updateDeploymentScript).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", content: "npm ci" },
    });

    await deploymentsUpdateScript(ctx);
    expect(vi.mocked(updateDeploymentScript)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100", content: "npm ci" },
      expect.anything(),
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("Deployment script updated."),
    );
  });

  it("should update the script from --file", async () => {
    const { readFileSync } = await import("node:fs");
    const { updateDeploymentScript } = await import("@studiometa/forge-core");
    vi.mocked(readFileSync).mockReturnValue("npm run build\n");
    vi.mocked(updateDeploymentScript).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", site: "100", file: "deploy.sh" },
    });

    await deploymentsUpdateScript(ctx);
    expect(vi.mocked(readFileSync)).toHaveBeenCalledWith("deploy.sh", "utf8");
    expect(vi.mocked(updateDeploymentScript)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100", content: "npm run build\n" },
      expect.anything(),
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      JSON.stringify({ status: "success", message: "Deployment script updated." }),
    );
  });

  it("should read the script from stdin with --file -", async () => {
    const { readFileSync } = await import("node:fs");
    const { updateDeploymentScript } = await import("@studiometa/forge-core");
    vi.mocked(readFileSync).mockReturnValue("from stdin");
    vi.mocked(updateDeploymentScript).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: "-" },
    });

    await deploymentsUpdateScript(ctx);
    expect(vi.mocked(readFileSync)).toHaveBeenCalledWith(0, "utf8");
    expect(vi.mocked(updateDeploymentScript)).toHaveBeenCalledWith(
      expect.objectContaining({ content: "from stdin" }),
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", site: "100", content: "npm ci" },
    });

    await deploymentsUpdateScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no site_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", content: "npm ci" },
    });

    await deploymentsUpdateScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no source is given", async () => {
    const { updateDeploymentScript } = await import("@studiometa/forge-core");
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsUpdateScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(
      expect.stringContaining("--file or --content"),
    );
    expect(vi.mocked(updateDeploymentScript)).not.toHaveBeenCalled();
  });

  it("should exit with error when both --file and --content are given", async () => {
    const { updateDeploymentScript } = await import("@studiometa/forge-core");
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: "a.sh", content: "npm ci" },
    });

    await deploymentsUpdateScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(expect.stringContaining("not both"));
    expect(vi.mocked(updateDeploymentScript)).not.toHaveBeenCalled();
  });

  it("should reject an empty --content", async () => {
    const { updateDeploymentScript } = await import("@studiometa/forge-core");
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", content: "  \n" },
    });

    await deploymentsUpdateScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(expect.stringContaining("empty"));
    expect(vi.mocked(updateDeploymentScript)).not.toHaveBeenCalled();
  });

  it("should reject --content without a value", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", content: true },
    });

    await deploymentsUpdateScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(expect.stringContaining("empty"));
  });

  it("should reject an empty file", async () => {
    const { readFileSync } = await import("node:fs");
    vi.mocked(readFileSync).mockReturnValue("");

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: "empty.sh" },
    });

    await deploymentsUpdateScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(expect.stringContaining("empty"));
  });

  it("should exit with error when --file has no path", async () => {
    const { readFileSync } = await import("node:fs");
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: true },
    });

    await deploymentsUpdateScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(
      expect.stringContaining("--file requires a path"),
    );
    expect(vi.mocked(readFileSync)).not.toHaveBeenCalled();
  });

  it("should exit with error when the file cannot be read", async () => {
    const { readFileSync } = await import("node:fs");
    const { updateDeploymentScript } = await import("@studiometa/forge-core");
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error("ENOENT: no such file or directory");
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: "missing.sh" },
    });

    await deploymentsUpdateScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(
      expect.stringContaining("Cannot read deployment script from missing.sh: ENOENT"),
    );
    expect(vi.mocked(updateDeploymentScript)).not.toHaveBeenCalled();
  });

  it("should report a non-Error value thrown while reading the file", async () => {
    const { readFileSync } = await import("node:fs");
    vi.mocked(readFileSync).mockImplementation(() => {
      // oxlint-disable-next-line no-throw-literal
      throw "boom";
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", file: "missing.sh" },
    });

    await deploymentsUpdateScript(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(
      expect.stringContaining("Cannot read deployment script from missing.sh: boom"),
    );
  });
});

describe("deploymentsDeploy --script-file", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should upload the script before triggering the deployment", async () => {
    const { readFileSync } = await import("node:fs");
    const { updateDeploymentScript, deploySiteAndWait } = await import("@studiometa/forge-core");
    const calls: string[] = [];
    vi.mocked(readFileSync).mockReturnValue("npm ci");
    vi.mocked(updateDeploymentScript).mockImplementation(async () => {
      calls.push("update");
      return { data: undefined };
    });
    vi.mocked(deploySiteAndWait).mockImplementation(async () => {
      calls.push("deploy");
      return { data: { status: "success", log: "Done.", elapsed_ms: 1000 } };
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", "script-file": "deploy.sh" },
    });

    await deploymentsDeploy(ctx);
    expect(vi.mocked(readFileSync)).toHaveBeenCalledWith("deploy.sh", "utf8");
    expect(vi.mocked(updateDeploymentScript)).toHaveBeenCalledWith(
      { server_id: "10", site_id: "100", content: "npm ci" },
      expect.anything(),
    );
    expect(calls).toEqual(["update", "deploy"]);
    expect(stderrSpy).toHaveBeenCalledWith("Deployment script updated.\n");
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("should not deploy and exit non-zero when the upload fails", async () => {
    const { readFileSync } = await import("node:fs");
    const { updateDeploymentScript, deploySiteAndWait } = await import("@studiometa/forge-core");
    vi.mocked(readFileSync).mockReturnValue("npm ci");
    vi.mocked(updateDeploymentScript).mockRejectedValue(new Error("Forge API error"));

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", "script-file": "deploy.sh" },
    });

    await deploymentsDeploy(ctx);
    expect(vi.mocked(deploySiteAndWait)).not.toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should not deploy when the script file is empty", async () => {
    const { readFileSync } = await import("node:fs");
    const { updateDeploymentScript, deploySiteAndWait } = await import("@studiometa/forge-core");
    vi.mocked(readFileSync).mockReturnValue("\n");

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100", "script-file": "deploy.sh" },
    });

    await deploymentsDeploy(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
    expect(vi.mocked(updateDeploymentScript)).not.toHaveBeenCalled();
    expect(vi.mocked(deploySiteAndWait)).not.toHaveBeenCalled();
  });

  it("should not upload a script when --script-file is absent", async () => {
    const { updateDeploymentScript, deploySiteAndWait } = await import("@studiometa/forge-core");
    vi.mocked(deploySiteAndWait).mockResolvedValue({
      data: { status: "success", log: "Done.", elapsed_ms: 1000 },
    });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsDeploy(ctx);
    expect(vi.mocked(updateDeploymentScript)).not.toHaveBeenCalled();
    expect(vi.mocked(deploySiteAndWait)).toHaveBeenCalled();
  });
});
