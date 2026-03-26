import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getUser } from "./get.ts";

describe("getUser", () => {
  it("should get user and format output with connected services", async () => {
    const getMock = async () =>
      mockDocument(1, "users", {
        name: "John Doe",
        email: "john@example.com",
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getUser({} as Record<string, never>, ctx);

    expect(result.data.name).toBe("John Doe");
  });

  it("should get user with minimal fields", async () => {
    const getMock = async () =>
      mockDocument(2, "users", {
        name: "Jane",
        email: "jane@example.com",
        created_at: null,
        updated_at: null,
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    await getUser({} as Record<string, never>, ctx);
  });
});
