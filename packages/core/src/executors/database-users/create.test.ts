import { describe, expect, it } from "vitest";

import type { DatabaseUserResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createDatabaseUser } from "./create.ts";

describe("createDatabaseUser", () => {
  it("should create a database user", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            user: { id: 7, name: "forge", status: "creating", server_id: 1, databases: [] },
          }) as DatabaseUserResponse,
      } as never,
    });

    const result = await createDatabaseUser(
      { server_id: "1", name: "forge", password: "secret" },
      ctx,
    );

    expect(result.data.name).toBe("forge");
  });

  it("should create a database user with databases", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            user: { id: 7, name: "forge", status: "creating", server_id: 1, databases: [1, 2] },
          }) as DatabaseUserResponse,
      } as never,
    });

    const result = await createDatabaseUser(
      { server_id: "1", name: "forge", password: "secret", databases: [1, 2] },
      ctx,
    );

    expect(result.data.databases).toEqual([1, 2]);
  });
});
