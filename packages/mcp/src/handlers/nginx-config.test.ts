import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleNginxConfig } from "./nginx-config.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => "server { listen 80; }",
        put: async () => ({}),
      } as never,
    },
    compact: true,
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
    expect(result.content[0]!.text).toContain("Unknown action");
  });
});
