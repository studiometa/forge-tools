import { describe, expect, it } from "vitest";

import { mockDocument, mockListDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleDeployments } from "./deployments.ts";

function makeDeploymentAttrs(overrides: Record<string, unknown> = {}) {
  return {
    commit: { hash: "abc1234", author: "user", message: "deploy", branch: "main" },
    status: "finished",
    type: "push",
    started_at: "2024-01-01",
    ended_at: "2024-01-01",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    ...overrides,
  };
}

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async (url: string) => {
          // Log endpoint for specific deployment (e.g. /deployments/1/log)
          if (/\/deployments\/\d+\/log$/.test(url)) {
            return mockDocument(1, "deployment-outputs", { output: "Build succeeded." });
          }
          // Specific deployment by ID (e.g. /deployments/1) - return finished status
          if (/\/deployments\/\d+$/.test(url)) {
            return mockDocument(1, "deployments", makeDeploymentAttrs({ status: "finished" }));
          }
          // Deployments list (with sort/pagination params)
          if (url.includes("/deployments?")) {
            return mockListDocument("deployments", [
              { id: 1, attributes: makeDeploymentAttrs() as never },
            ]);
          }
          return {};
        },
        // POST to create deployment returns the deployment document with ID
        post: async () =>
          mockDocument(1, "deployments", makeDeploymentAttrs({ status: "queued", started_at: null })),
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
    expect(result.content[0].text).toContain("server_id");
  });

  it("should require site_id", async () => {
    const result = await handleDeployments(
      "list",
      { resource: "deployments", action: "list", server_id: "123" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("site_id");
  });

  it("should reject path traversal in server_id", async () => {
    const result = await handleDeployments(
      "list",
      { resource: "deployments", action: "list", server_id: "../etc", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid server_id");
  });

  it("should reject path traversal in site_id", async () => {
    const result = await handleDeployments(
      "list",
      { resource: "deployments", action: "list", server_id: "123", site_id: "../../x" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid site_id");
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
    expect(result.content[0].text).toContain("Invalid id");
  });

  it("should list deployments", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        organizationSlug: "test-org",
        client: {
          get: async () =>
            mockListDocument("deployments", [
              { id: 1, attributes: makeDeploymentAttrs() as never },
            ]),
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
    expect(result.content[0].text).toContain("deployment");
  });

  it("should deploy a site and return result with log", async () => {
    const result = await handleDeployments(
      "deploy",
      { resource: "deployments", action: "deploy", server_id: "123", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Deployment");
    expect(result.content[0].text).toContain("456");
  });

  it("should show success status and log in deploy result", async () => {
    const result = await handleDeployments(
      "deploy",
      { resource: "deployments", action: "deploy", server_id: "123", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("succeeded");
    expect(result.content[0].text).toContain("Build succeeded.");
  });

  it("should handle unknown action", async () => {
    const result = await handleDeployments(
      "unknown",
      { resource: "deployments", action: "unknown", server_id: "123", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown action");
  });

  it("should require content for update", async () => {
    const result = await handleDeployments(
      "update",
      { resource: "deployments", action: "update", server_id: "123", site_id: "456" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("content");
  });

  it("should get deployment output with id", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        organizationSlug: "test-org",
        client: {
          get: async () =>
            mockDocument(1, "deployment-outputs", { output: "Deployment output log" }),
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
        organizationSlug: "test-org",
        client: {
          get: async () =>
            mockDocument(1, "deployment-scripts", {
              content: "#!/bin/bash\ncd /home/forge",
              auto_source: "",
            }),
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
        organizationSlug: "test-org",
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
    expect(result.content[0].text).toContain("updated");
  });

  it("should list deployments in non-compact mode", async () => {
    const ctx: HandlerContext = {
      executorContext: {
        organizationSlug: "test-org",
        client: {
          get: async () =>
            mockListDocument("deployments", [
              { id: 1, attributes: makeDeploymentAttrs() as never },
            ]),
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
    const parsed = JSON.parse(result.content[0].text);
    expect(Array.isArray(parsed)).toBe(true);
  });
});
