import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deploySiteAndWait } from "./deploy-and-wait.ts";

describe("deploySiteAndWait", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should trigger deploy, poll until done, and return success", async () => {
    const postMock = vi.fn(async () => undefined);

    let pollCount = 0;
    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) {
        return "Build succeeded\nDone.";
      }
      if (url.endsWith("/deployments")) {
        return { deployments: [{ id: 1, status: "finished" }] };
      }
      // site poll — first call returns "deploying", second returns null (done)
      pollCount++;
      return {
        site: {
          id: 456,
          deployment_status: pollCount === 1 ? "deploying" : null,
        },
      };
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100 },
      ctx,
    );

    // Advance timers for each poll tick
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(postMock).toHaveBeenCalledWith("/servers/123/sites/456/deployment/deploy");
    expect(result.data.status).toBe("success");
    expect(result.data.log).toBe("Build succeeded\nDone.");
    expect(result.data.elapsed_ms).toBeGreaterThanOrEqual(0);
  });

  it("should return failed when latest deployment status is not finished", async () => {
    const postMock = vi.fn(async () => undefined);

    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) {
        return "Error: build failed.";
      }
      if (url.endsWith("/deployments")) {
        return { deployments: [{ id: 1, status: "failed" }] };
      }
      // site always returns null on first poll (deploy finished instantly)
      return { site: { id: 456, deployment_status: null } };
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100 },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.data.status).toBe("failed");
    expect(result.data.log).toBe("Error: build failed.");
  });

  it("should call onProgress callback on each poll iteration", async () => {
    const postMock = vi.fn(async () => undefined);

    let pollCount = 0;
    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) return "log";
      if (url.endsWith("/deployments")) return { deployments: [{ id: 1, status: "finished" }] };
      pollCount++;
      return {
        site: { id: 456, deployment_status: pollCount < 2 ? "deploying" : null },
      };
    });

    const onProgress = vi.fn();

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, onProgress },
      ctx,
    );

    await vi.runAllTimersAsync();
    await promise;

    expect(onProgress).toHaveBeenCalled();
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ status: expect.any(String), elapsed_ms: expect.any(Number) }),
    );
  });

  it("should return failed when timeout_ms is exceeded", async () => {
    const postMock = vi.fn(async () => undefined);

    // Site always in "deploying" state (never finishes)
    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) return "partial log";
      if (url.endsWith("/deployments")) return { deployments: [{ id: 1, status: "deploying" }] };
      return { site: { id: 456, deployment_status: "deploying" } };
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
    });

    // Very short timeout
    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, timeout_ms: 50 },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.data.status).toBe("failed");
  });

  it("should handle log fetch errors gracefully", async () => {
    const postMock = vi.fn(async () => undefined);

    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) throw new Error("log not available");
      if (url.endsWith("/deployments")) return { deployments: [{ id: 1, status: "finished" }] };
      return { site: { id: 456, deployment_status: null } };
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100 },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.data.log).toBe("");
    expect(result.data.status).toBe("success");
  });

  it("should handle deployments fetch errors gracefully and default to failed", async () => {
    const postMock = vi.fn(async () => undefined);

    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) return "some log";
      if (url.endsWith("/deployments")) throw new Error("not available");
      return { site: { id: 456, deployment_status: null } };
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100 },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    // If deployments fetch fails we default to 'failed'
    expect(result.data.status).toBe("failed");
  });
});
