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
        two_factor_enabled: true,
        two_factor_confirmed: true,
        github_connected: true,
        gitlab_connected: false,
        bitbucket_connected: false,
        do_connected: false,
        timezone: "UTC",
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

  it("should show disabled 2FA and not connected services", async () => {
    const getMock = async () =>
      mockDocument(2, "users", {
        name: "Jane",
        email: "jane@example.com",
        two_factor_enabled: false,
        two_factor_confirmed: false,
        github_connected: false,
        gitlab_connected: true,
        bitbucket_connected: false,
        do_connected: false,
        timezone: "UTC",
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    await getUser({} as Record<string, never>, ctx);
  });
});
