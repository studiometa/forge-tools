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

  it("should stream log output incrementally via onLog callback", async () => {
    const postMock = vi.fn(async () => undefined);

    let pollCount = 0;
    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) return "line1\nline2\nline3\n";
      if (url.endsWith("/deployments")) {
        return { deployments: [{ id: 42, status: "finished" }] };
      }
      if (url.includes("/deployments/42/output")) {
        // Simulate incremental output growth
        if (pollCount <= 1) return "line1\n";
        return "line1\nline2\nline3\n";
      }
      // site poll
      pollCount++;
      return {
        site: { id: 456, deployment_status: pollCount < 3 ? "deploying" : null },
      };
    });

    const onLog = vi.fn();

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, onLog },
      ctx,
    );

    await vi.runAllTimersAsync();
    await promise;

    // onLog should have been called with incremental chunks
    expect(onLog).toHaveBeenCalled();

    // Reconstruct streamed output
    const streamed = onLog.mock.calls.map((c) => c[0]).join("");
    // Should contain the full log content
    expect(streamed).toContain("line1\n");
    expect(streamed).toContain("line2\n");
    expect(streamed).toContain("line3\n");
  });

  it("should not fetch deployment output when onLog is not provided", async () => {
    const postMock = vi.fn(async () => undefined);

    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) return "log content";
      if (url.endsWith("/deployments")) return { deployments: [{ id: 42, status: "finished" }] };
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
    await promise;

    // Should never call the deployment output endpoint
    const outputCalls = getMock.mock.calls.filter((c) => String(c[0]).includes("/output"));
    expect(outputCalls).toHaveLength(0);
  });

  it("should handle deployment output fetch errors gracefully", async () => {
    const postMock = vi.fn(async () => undefined);

    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) return "final log";
      if (url.includes("/deployments/42/output")) throw new Error("output not ready");
      if (url.endsWith("/deployments")) return { deployments: [{ id: 42, status: "finished" }] };
      return { site: { id: 456, deployment_status: null } };
    });

    const onLog = vi.fn();

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, onLog },
      ctx,
    );

    await vi.runAllTimersAsync();
    await promise;

    // onLog should still be called with the final log content
    expect(onLog).toHaveBeenCalledWith("final log");
  });

  it("should emit remaining log content from final log fetch", async () => {
    const postMock = vi.fn(async () => undefined);

    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) return "line1\nline2\nline3\n";
      if (url.includes("/deployments/42/output")) return "line1\n";
      if (url.endsWith("/deployments")) return { deployments: [{ id: 42, status: "finished" }] };
      return { site: { id: 456, deployment_status: null } };
    });

    const onLog = vi.fn();

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, onLog },
      ctx,
    );

    await vi.runAllTimersAsync();
    await promise;

    // Should have emitted "line1\n" from output, then "line2\nline3\n" from final log
    const streamed = onLog.mock.calls.map((c) => c[0]).join("");
    expect(streamed).toBe("line1\nline2\nline3\n");
  });

  it("should handle deployments list failure when resolving deployment ID for onLog", async () => {
    const postMock = vi.fn(async () => undefined);

    let deploymentsCallCount = 0;
    const getMock = vi.fn(async (url: string) => {
      if (url.endsWith("/deployment/log")) return "the log";
      if (url.endsWith("/deployments")) {
        deploymentsCallCount++;
        // First call (to resolve deployment ID) fails, second call (to check status) succeeds
        if (deploymentsCallCount === 1) throw new Error("not available");
        return { deployments: [{ id: 1, status: "finished" }] };
      }
      return { site: { id: 456, deployment_status: null } };
    });

    const onLog = vi.fn();

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, onLog },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    // Should still succeed, just without streaming
    expect(result.data.status).toBe("success");
    // onLog should still receive the final log content
    expect(onLog).toHaveBeenCalledWith("the log");
  });
});
