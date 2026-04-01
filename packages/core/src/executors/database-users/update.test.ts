import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { updateDatabaseUser } from "./update.ts";

describe("updateDatabaseUser", () => {
  it("should update a database user password", async () => {
    const ctx = createTestExecutorContext({
      client: {
        put: async () =>
          mockDocument(7, "database-users", {
            name: "forge",
            status: "installed",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await updateDatabaseUser(
      { server_id: "1", id: "7", password: "new-secret" },
      ctx,
    );

    expect(result.data.id).toBe(7);
    expect(result.data.name).toBe("forge");
  });

  it("should update database user database_ids", async () => {
    const ctx = createTestExecutorContext({
      client: {
        put: async () =>
          mockDocument(7, "database-users", {
            name: "forge",
            status: "installed",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await updateDatabaseUser(
      { server_id: "1", id: "7", database_ids: [1, 2, 3] },
      ctx,
    );

    expect(result.data.id).toBe(7);
    expect(result.data.name).toBe("forge");
  });
});
