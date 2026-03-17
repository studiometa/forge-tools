import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getDatabaseUser } from "./get.ts";

describe("getDatabaseUser", () => {
  it("should get a database user", async () => {
    const getMock = async () =>
      mockDocument(7, "database-users", {
        name: "forge",
        status: "installed",
        can_access_all_databases: false,
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getDatabaseUser({ server_id: "1", id: "7" }, ctx);

    expect(result.data.name).toBe("forge");
  });
});
