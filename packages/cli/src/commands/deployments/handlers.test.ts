import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeDeployment } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import { deploymentsList, deploymentsDeploy } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listDeployments: vi.fn(),
  deploySite: vi.fn(),
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

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should trigger deployment", async () => {
    const { deploySite } = await import("@studiometa/forge-core");
    vi.mocked(deploySite).mockResolvedValue({ data: undefined as never });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "human", server: "10", site: "100" },
    });

    await deploymentsDeploy(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(
      expect.stringContaining("Deployment triggered"),
    );
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
