import { describe, expect, it } from "vitest";

import { mockDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleUser } from "./user.ts";

function createMockContext(): HandlerContext {
  return {
    executorContext: {
      organizationSlug: "test-org",
      client: {
        get: async () =>
          mockDocument(1, "users", {
            name: "John Doe",
            email: "john@example.com",
            created_at: "2024-01-01",
            updated_at: "2024-01-01",
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
