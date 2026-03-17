import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listDatabaseUsers } from "./list.ts";

describe("listDatabaseUsers", () => {
  it("should list database users on a server", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () =>
          mockListDocument("database-users", [
            {
              id: 1,
              attributes: {
                name: "forge",
                status: "installed",
                can_access_all_databases: false,
                created_at: "2024-01-01T00:00:00.000000Z",
                updated_at: "2024-01-01T00:00:00.000000Z",
              },
            },
          ]),
      } as never,
      organizationSlug: "test-org",
    });
    const result = await listDatabaseUsers({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("database-users", []) } as never,
      organizationSlug: "test-org",
    });
    const result = await listDatabaseUsers({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(0);
  });
});
