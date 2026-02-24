import { describe, expect, it } from "vitest";

import type { HandlerContext } from "./types.ts";

import { handleUser } from "./user.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      client: {
        get: async () => ({
          user: {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            connected_to_github: true,
            connected_to_gitlab: false,
            two_factor_enabled: true,
          },
        }),
      } as never,
    },
    compact: true,
  };
}

describe("handleUser", () => {
  it("should get user profile", async () => {
    const result = await handleUser(
      "get",
      { resource: "user", action: "get" },
      createMockContext(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain("John Doe");
  });

  it("should handle unknown action", async () => {
    const result = await handleUser(
      "unknown",
      { resource: "user", action: "unknown" },
      createMockContext(),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain("Unknown action");
  });
});
