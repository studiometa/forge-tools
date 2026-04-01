import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { deploySiteAndWait } from "./deploy-and-wait.ts";

/**
 * Helper to create deployment attributes
 */
function deploymentAttrs(
  status: string,
  overrides: Partial<{
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
    updated_at: string;
  }> = {},
) {
  return {
    commit: { hash: null, author: null, message: null, branch: null },
    status,
    type: "push",
    started_at: overrides.started_at ?? "2024-01-01T00:00:00.000000Z",
    ended_at: overrides.ended_at ?? null,
    created_at: overrides.created_at ?? "2024-01-01T00:00:00.000000Z",
    updated_at: overrides.updated_at ?? "2024-01-01T00:00:00.000000Z",
  };
}

describe("deploySiteAndWait", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should trigger deploy, poll until done, and return success", async () => {
    // POST to create deployment returns the deployment document
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("queued", { started_at: null })),
    );

    let pollCount = 0;
    const getMock = vi.fn(async (url: string) => {
      // Poll the specific deployment by ID
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        pollCount++;
        if (pollCount === 1) {
          return mockDocument(123, "deployments", deploymentAttrs("deploying"));
        }
        // Second poll: finished
        return mockDocument(123, "deployments", deploymentAttrs("finished"));
      }
      if (url.includes("/deployments/123/log")) {
        return mockDocument(123, "deployment-logs", { output: "Build succeeded\nDone." });
      }
      throw new Error("Unexpected URL: " + url);
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100 },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(postMock).toHaveBeenCalledWith("/orgs/test-org/servers/123/sites/456/deployments", {});
    expect(result.data.status).toBe("success");
    expect(result.data.log).toBe("Build succeeded\nDone.");
    expect(result.data.elapsed_ms).toBeGreaterThanOrEqual(0);
  });

  it("should return failed when deployment status is failed", async () => {
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("queued", { started_at: null })),
    );

    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        return mockDocument(123, "deployments", deploymentAttrs("failed"));
      }
      if (url.includes("/deployments/123/log")) {
        return mockDocument(123, "deployment-logs", { output: "Error: build failed." });
      }
      throw new Error("Unexpected URL: " + url);
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
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

  it("should return failed when deployment status is failed-build", async () => {
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("queued", { started_at: null })),
    );

    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        return mockDocument(123, "deployments", deploymentAttrs("failed-build"));
      }
      if (url.includes("/deployments/123/log")) {
        return mockDocument(123, "deployment-logs", { output: "Build error." });
      }
      throw new Error("Unexpected URL: " + url);
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100 },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.data.status).toBe("failed");
  });

  it("should call onProgress callback on each poll iteration", async () => {
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("queued", { started_at: null })),
    );

    let pollCount = 0;
    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        pollCount++;
        if (pollCount < 3) {
          return mockDocument(123, "deployments", deploymentAttrs("deploying"));
        }
        return mockDocument(123, "deployments", deploymentAttrs("finished"));
      }
      if (url.includes("/deployments/123/log")) {
        return mockDocument(123, "deployment-logs", { output: "log" });
      }
      throw new Error("Unexpected URL: " + url);
    });

    const onProgress = vi.fn();

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, onProgress },
      ctx,
    );

    await vi.runAllTimersAsync();
    await promise;

    expect(onProgress).toHaveBeenCalled();
    // Should have been called with deploying status
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ status: "deploying", elapsed_ms: expect.any(Number) }),
    );
  });

  it("should return failed when timeout_ms is exceeded", async () => {
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("queued", { started_at: null })),
    );

    // Status always returns deploying (never finishes)
    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        return mockDocument(123, "deployments", deploymentAttrs("deploying"));
      }
      if (url.includes("/deployments/123/log")) {
        return mockDocument(123, "deployment-logs", { output: "partial log" });
      }
      throw new Error("Unexpected URL: " + url);
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
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
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("queued", { started_at: null })),
    );

    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        return mockDocument(123, "deployments", deploymentAttrs("finished"));
      }
      if (url.includes("/deployments/123/log")) {
        throw new Error("log not available");
      }
      throw new Error("Unexpected URL: " + url);
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
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

  it("should stream logs via onLog during polling when deployment is active", async () => {
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("queued", { started_at: null })),
    );

    let pollCount = 0;
    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        pollCount++;
        if (pollCount < 2) {
          return mockDocument(123, "deployments", deploymentAttrs("deploying"));
        }
        return mockDocument(123, "deployments", deploymentAttrs("finished"));
      }
      if (url.includes("/deployments/123/log")) {
        return mockDocument(123, "deployment-logs", {
          output: "Step 1\nStep 2\nStep 3\nDone.",
        });
      }
      throw new Error("Unexpected URL: " + url);
    });

    const onLog = vi.fn();

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, onLog },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(onLog).toHaveBeenCalled();
    expect(result.data.status).toBe("success");
    expect(result.data.log).toBe("Step 1\nStep 2\nStep 3\nDone.");
  });

  it("should emit remaining log content after polling via onLog", async () => {
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("finished")),
    );

    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        return mockDocument(123, "deployments", deploymentAttrs("finished"));
      }
      if (url.includes("/deployments/123/log")) {
        return mockDocument(123, "deployment-logs", {
          output: "Full log output here.",
        });
      }
      throw new Error("Unexpected URL: " + url);
    });

    const onLog = vi.fn();

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, onLog },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    // onLog should be called with the full log
    expect(onLog).toHaveBeenCalledWith("Full log output here.");
    expect(result.data.status).toBe("success");
  });

  it("should handle log fetch error during polling gracefully with onLog", async () => {
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("queued", { started_at: null })),
    );

    let pollCount = 0;
    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        pollCount++;
        if (pollCount < 2) {
          return mockDocument(123, "deployments", deploymentAttrs("deploying"));
        }
        return mockDocument(123, "deployments", deploymentAttrs("finished"));
      }
      if (url.includes("/deployments/123/log")) {
        // First call fails, second succeeds
        if (pollCount === 1) {
          throw new Error("log not available yet");
        }
        return mockDocument(123, "deployment-logs", { output: "log content" });
      }
      throw new Error("Unexpected URL: " + url);
    });

    const onLog = vi.fn();

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, onLog },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    // Should not crash despite the error during polling log fetch
    expect(result.data.status).toBe("success");
  });

  it("should emit remaining log content via onLog when final log is longer than streamed", async () => {
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("queued", { started_at: null })),
    );

    let logFetchCount = 0;
    let pollCount = 0;
    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        pollCount++;
        if (pollCount < 2) {
          return mockDocument(123, "deployments", deploymentAttrs("deploying"));
        }
        return mockDocument(123, "deployments", deploymentAttrs("finished"));
      }
      if (url.includes("/deployments/123/log")) {
        logFetchCount++;
        // First call during polling returns partial log, subsequent calls return full
        if (logFetchCount === 1) {
          return mockDocument(123, "deployment-logs", { output: "Step 1\n" });
        }
        return mockDocument(123, "deployment-logs", { output: "Step 1\nStep 2\nDone." });
      }
      throw new Error("Unexpected URL: " + url);
    });

    const onLog = vi.fn();

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100, onLog },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    // onLog should be called with incremental content
    expect(onLog).toHaveBeenCalledWith("Step 1\n");
    expect(onLog).toHaveBeenCalledWith("Step 2\nDone.");
    expect(result.data.status).toBe("success");
  });

  it("should handle deployment fetch errors gracefully and default to failed", async () => {
    const postMock = vi.fn(async () =>
      mockDocument(123, "deployments", deploymentAttrs("queued", { started_at: null })),
    );

    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/123") && !url.includes("/log")) {
        throw new Error("deployment not available");
      }
      throw new Error("Unexpected URL: " + url);
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100 },
      ctx,
    );

    await vi.runAllTimersAsync();
    const result = await promise;

    // If deployment fetch fails we default to 'failed'
    expect(result.data.status).toBe("failed");
  });
});
