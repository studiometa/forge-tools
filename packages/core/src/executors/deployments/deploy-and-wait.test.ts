import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { mockDocument, mockListDocument } from "../../test-helpers.ts";
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
      if (url.includes("/deployments/status")) {
        // first poll: deploying, second poll: 404 (throw → treated as done)
        pollCount++;
        if (pollCount === 1) {
          return mockDocument(1, "deployment-statuses", {
            status: "deploying",
            started_at: "2024-01-01T00:00:00.000000Z",
          });
        }
        throw new Error("Not found");
      }
      if (url.includes("/deployments?page")) {
        return mockListDocument("deployments", [
          {
            id: 1,
            attributes: {
              commit: { hash: null, author: null, message: null, branch: null },
              status: "finished",
              type: "push",
              started_at: "2024-01-01T00:00:00.000000Z",
              ended_at: "2024-01-01T00:05:00.000000Z",
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:05:00.000000Z",
            },
          },
        ]);
      }
      if (url.includes("/deployments/") && url.includes("/log")) {
        return mockDocument(1, "deployment-logs", { output: "Build succeeded\nDone." });
      }
      return mockDocument(1, "deployments", {
        commit: { hash: null, author: null, message: null, branch: null },
        status: "finished",
        type: "push",
        started_at: "2024-01-01T00:00:00.000000Z",
        ended_at: null,
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });
    });

    const ctx = createTestExecutorContext({
      client: { post: postMock, get: getMock } as never,
      organizationSlug: "test-org",
    });

    const promise = deploySiteAndWait(
      { server_id: "123", site_id: "456", poll_interval_ms: 100 },
      ctx,
    );

    // Advance timers for each poll tick
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(postMock).toHaveBeenCalledWith("/orgs/test-org/servers/123/sites/456/deployments");
    expect(result.data.status).toBe("success");
    expect(result.data.log).toBe("Build succeeded\nDone.");
    expect(result.data.elapsed_ms).toBeGreaterThanOrEqual(0);
  });

  it("should return failed when latest deployment status is not finished", async () => {
    const postMock = vi.fn(async () => undefined);

    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/status")) {
        throw new Error("Not found"); // No active deployment → done immediately
      }
      if (url.includes("/deployments?page")) {
        return mockListDocument("deployments", [
          {
            id: 1,
            attributes: {
              commit: { hash: null, author: null, message: null, branch: null },
              status: "failed",
              type: "push",
              started_at: "2024-01-01T00:00:00.000000Z",
              ended_at: "2024-01-01T00:01:00.000000Z",
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:01:00.000000Z",
            },
          },
        ]);
      }
      if (url.includes("/deployments/") && url.includes("/log")) {
        return mockDocument(1, "deployment-logs", { output: "Error: build failed." });
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

  it("should call onProgress callback on each poll iteration", async () => {
    const postMock = vi.fn(async () => undefined);

    let pollCount = 0;
    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/status")) {
        pollCount++;
        if (pollCount < 2) {
          return mockDocument(1, "deployment-statuses", {
            status: "deploying",
            started_at: "2024-01-01T00:00:00.000000Z",
          });
        }
        throw new Error("Not found");
      }
      if (url.includes("/deployments?page")) {
        return mockListDocument("deployments", [
          {
            id: 1,
            attributes: {
              commit: { hash: null, author: null, message: null, branch: null },
              status: "finished",
              type: "push",
              started_at: "2024-01-01T00:00:00.000000Z",
              ended_at: "2024-01-01T00:05:00.000000Z",
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:05:00.000000Z",
            },
          },
        ]);
      }
      if (url.includes("/deployments/") && url.includes("/log")) {
        return mockDocument(1, "deployment-logs", { output: "log" });
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
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ status: expect.any(String), elapsed_ms: expect.any(Number) }),
    );
  });

  it("should return failed when timeout_ms is exceeded", async () => {
    const postMock = vi.fn(async () => undefined);

    // Status always returns deploying (never finishes)
    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/status")) {
        return mockDocument(1, "deployment-statuses", {
          status: "deploying",
          started_at: "2024-01-01T00:00:00.000000Z",
        });
      }
      if (url.includes("/deployments?page")) {
        return mockListDocument("deployments", [
          {
            id: 1,
            attributes: {
              commit: { hash: null, author: null, message: null, branch: null },
              status: "deploying",
              type: "push",
              started_at: "2024-01-01T00:00:00.000000Z",
              ended_at: null,
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:00:00.000000Z",
            },
          },
        ]);
      }
      if (url.includes("/deployments/") && url.includes("/log")) {
        return mockDocument(1, "deployment-logs", { output: "partial log" });
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
    const postMock = vi.fn(async () => undefined);

    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/status")) {
        throw new Error("Not found"); // Done immediately
      }
      if (url.includes("/deployments?page")) {
        return mockListDocument("deployments", [
          {
            id: 1,
            attributes: {
              commit: { hash: null, author: null, message: null, branch: null },
              status: "finished",
              type: "push",
              started_at: "2024-01-01T00:00:00.000000Z",
              ended_at: "2024-01-01T00:05:00.000000Z",
              created_at: "2024-01-01T00:00:00.000000Z",
              updated_at: "2024-01-01T00:05:00.000000Z",
            },
          },
        ]);
      }
      if (url.includes("/deployments/") && url.includes("/log")) {
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

  it("should handle deployments fetch errors gracefully and default to failed", async () => {
    const postMock = vi.fn(async () => undefined);

    const getMock = vi.fn(async (url: string) => {
      if (url.includes("/deployments/status")) {
        throw new Error("Not found"); // Done immediately
      }
      if (url.includes("/deployments?page")) {
        throw new Error("not available");
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

    // If deployments fetch fails we default to 'failed'
    expect(result.data.status).toBe("failed");
  });
});
