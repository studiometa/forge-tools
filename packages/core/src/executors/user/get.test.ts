import { describe, expect, it } from "vitest";

import type { UserResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getUser } from "./get.ts";

describe("getUser", () => {
  it("should get user and format output with connected services", async () => {
    const user = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      connected_to_github: true,
      connected_to_gitlab: false,
      two_factor_enabled: true,
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ user }) as UserResponse,
      } as never,
    });

    const result = await getUser({} as Record<string, never>, ctx);

    expect(result.data.name).toBe("John Doe");
  });

  it("should show disabled 2FA and not connected services", async () => {
    const user = {
      id: 2,
      name: "Jane",
      email: "jane@example.com",
      connected_to_github: false,
      connected_to_gitlab: true,
      two_factor_enabled: false,
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ user }) as UserResponse,
      } as never,
    });

    await getUser({} as Record<string, never>, ctx);
  });
});
