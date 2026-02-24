import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleEnv } from "./env.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => "APP_ENV=production\nAPP_KEY=abc123",
        put: async () => ({}),
      } as never,
    },
    compact: true,
  };
}

describe("handleEnv", () => {
  it("should get environment variables", async () => {
    const result = await handleEnv(
      "get",
      { resource: "env", action: "get", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("APP_ENV=production");
  });

  it("should update environment variables", async () => {
    const result = await handleEnv(
      "update",
      {
        resource: "env",
        action: "update",
        server_id: "1",
        site_id: "10",
        content: "APP_ENV=production",
      },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("Environment variables updated");
  });

  it("should require server_id and site_id for get", async () => {
    const result = await handleEnv("get", { resource: "env", action: "get" }, createMockContext());
    expect(result.isError).toBe(true);
  });

  it("should handle unknown action", async () => {
    const result = await handleEnv(
      "unknown",
      { resource: "env", action: "unknown", server_id: "1", site_id: "10" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
  });
});
