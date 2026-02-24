import { describe, expect, it } from "vitest";

import type { DatabaseUserResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getDatabaseUser } from "./get.ts";

describe("getDatabaseUser", () => {
  it("should get a database user", async () => {
    const user = {
      id: 7,
      name: "forge",
      status: "installed",
      server_id: 1,
      databases: [1, 2],
      created_at: "2024-01-01T00:00:00.000000Z",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ user }) as DatabaseUserResponse,
      } as never,
    });

    const result = await getDatabaseUser({ server_id: "1", id: "7" }, ctx);

    expect(result.data.name).toBe("forge");
    expect(result.data.databases).toEqual([1, 2]);
  });
});
