import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleNginxConfig } from "./nginx-config.ts";

function createMockContext(compact = true): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async () => ({
          data: {
            id: "1",
            type: "nginx-configs",
            attributes: { content: "server { listen 80; }" },
          },
        }),
        put: async () => ({}),
      } as never,
    },
    compact,
  };
}

describe("handleNginxConfig", () => {
  it("should get nginx config", async () => {
    const result = await handleNginxConfig(
      "get",
      { resource: "nginx", action: "get", server_id: "1", site_id: "2" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
  });

  it("should update nginx config", async () => {
    const result = await handleNginxConfig(
      "update",
      {
        resource: "nginx",
        action: "update",
        server_id: "1",
        site_id: "2",
        content: "server { listen 443; }",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
  });

  it("should handle unknown action", async () => {
    const result = await handleNginxConfig(
      "unknown",
      { resource: "nginx", action: "unknown", server_id: "1", site_id: "2" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown action");
  });
});

describe("handleNginxConfig check", () => {
  const args = { resource: "nginx", action: "check", server_id: "1", site_id: "2" };

  it("should report in sync for equal content", async () => {
    const result = await handleNginxConfig(
      "check",
      { ...args, content: "server { listen 80; }\n" },
      createMockContext(false),
    );
    expect(result.structuredContent).toEqual({ success: true, result: { inSync: true } });
  });

  it("should return a unified diff when the content differs", async () => {
    const result = await handleNginxConfig(
      "check",
      { ...args, content: "server { listen 443; }" },
      createMockContext(false),
    );
    expect(result.structuredContent).toEqual({
      success: true,
      result: {
        inSync: false,
        diff: "--- remote\n+++ local\n@@ -1,1 +1,1 @@\n-server { listen 80; }\n+server { listen 443; }",
      },
    });
  });

  it("should format the diff in compact output", async () => {
    const result = await handleNginxConfig(
      "check",
      { ...args, content: "server { listen 443; }" },
      createMockContext(),
    );
    expect(result.content[0].text).toMatch(/^Nginx configuration differs from Forge:\n--- remote/);
  });

  it("should require content", async () => {
    const result = await handleNginxConfig("check", args, createMockContext());
    expect(result.isError).toBe(true);
  });
});
