import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createDatabaseUser } from "./create.ts";

describe("createDatabaseUser", () => {
  it("should create a database user", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(7, "database-users", {
            name: "forge",
            status: "creating",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createDatabaseUser(
      { server_id: "1", name: "forge", password: "secret" },
      ctx,
    );

    expect(result.data.name).toBe("forge");
  });

  it("should create a database user with databases list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(7, "database-users", {
            name: "forge",
            status: "creating",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createDatabaseUser(
      { server_id: "1", name: "forge", password: "secret", databases: [1, 2] },
      ctx,
    );

    expect(result.data.name).toBe("forge");
  });
});
