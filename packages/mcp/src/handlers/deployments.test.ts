import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleDeployments } from "./deployments.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async (url: string) => {
          if ((url as string).endsWith("/deployment/log")) {
            return "Build succeeded.";
          }
          if ((url as string).endsWith("/deployments")) {
            return {
              deployments: [
                { id: 1, status: "finished", commit_hash: "abc1234", started_at: "2024-01-01" },
              ],
            };
          }
          if ((url as string).endsWith("/deployments")) {
            return {
              deployments: [
                { id: 1, status: "deployed", commit_hash: "abc1234", started_at: "2024-01-01" },
              ],
            };
          }
          // site poll — return null deployment_status immediately (done)
          return { site: { id: 456, deployment_status: null } };
        },
        post: async () => ({}),
        put: async () => ({}),
      } as never,
    },
    compact: true,
  };
}

describe("handleDeployments", () => {
  it("should require server_id", async () => {
    const result = await handleDeployments(
      "list",
      { resource: "deployments", action: "list", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("server_id");
  });

  it("should require site_id", async () => {
    const result = await handleDeployments(
      "list",
      { resource: "deployments", action: "list", server_id: "123" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("site_id");
  });

  it("should reject path traversal in server_id", async () => {
    const result = await handleDeployments(
      "list",
      { resource: "deployments", action: "list", server_id: "../etc", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Invalid server_id");
  });

  it("should reject path traversal in site_id", async () => {
    const result = await handleDeployments(
      "list",
      { resource: "deployments", action: "list", server_id: "123", site_id: "../../x" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Invalid site_id");
  });

  it("should reject path traversal in id", async () => {
    const result = await handleDeployments(
      "get",
      {
        resource: "deployments",
        action: "get",
        server_id: "123",
        site_id: "456",
        id: "../../../etc/passwd",
      },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Invalid id");
  });

  it("should list deployments", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        client: {
          get: async () => ({
            deployments: [
              { id: 1, status: "deployed", commit_hash: "abc1234", started_at: "2024-01-01" },
            ],
          }),
        } as never,
      },
      compact: true,
    };
    const result = await handleDeployments(
      "list",
      { resource: "deployments", action: "list", server_id: "123", site_id: "456" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("deployment");
  });

  it("should deploy a site and return result with log", async () => {
    const result = await handleDeployments(
      "deploy",
      { resource: "deployments", action: "deploy", server_id: "123", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("Deployment");
    expect(result.content[0]!.text).toContain("456");
  });

  it("should show success status and log in deploy result", async () => {
    const result = await handleDeployments(
      "deploy",
      { resource: "deployments", action: "deploy", server_id: "123", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("succeeded");
    expect(result.content[0]!.text).toContain("Build succeeded.");
  });

  it("should handle unknown action", async () => {
    const result = await handleDeployments(
      "unknown",
      { resource: "deployments", action: "unknown", server_id: "123", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });

  it("should require content for update", async () => {
    const result = await handleDeployments(
      "update",
      { resource: "deployments", action: "update", server_id: "123", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("content");
  });

  it("should get deployment output with id", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        client: {
          get: async () => ({ output: "Deployment output log" }),
        } as never,
      },
      compact: true,
    };
    const result = await handleDeployments(
      "get",
      { resource: "deployments", action: "get", server_id: "123", site_id: "456", id: "1" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should get deployment script without id", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        client: {
          get: async () => "#!/bin/bash\ncd /home/forge",
        } as never,
      },
      compact: true,
    };
    const result = await handleDeployments(
      "get",
      { resource: "deployments", action: "get", server_id: "123", site_id: "456" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
  });

  it("should update deployment script with content", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        client: {
          put: async () => ({}),
        } as never,
      },
      compact: true,
    };
    const result = await handleDeployments(
      "update",
      {
        resource: "deployments",
        action: "update",
        server_id: "123",
        site_id: "456",
        content: "#!/bin/bash\necho deploy",
      },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("updated");
  });

  it("should list deployments in non-compact mode", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        client: {
          get: async () => ({
            deployments: [
              { id: 1, status: "deployed", commit_hash: "abc1234", started_at: "2024-01-01" },
            ],
          }),
        } as never,
      },
      compact: false,
    };
    const result = await handleDeployments(
      "list",
      { resource: "deployments", action: "list", server_id: "123", site_id: "456" },
      ctx,
    );
    expect(result.isError).toBeUndefined();
    // non-compact returns raw data
    const parsed = JSON.parse(result.content[0]!.text);
    expect(Array.isArray(parsed)).toBe(true);
  });
});
