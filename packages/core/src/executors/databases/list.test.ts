import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listDatabases } from "./list.ts";

describe("listDatabases", () => {
  it("should list databases on a server", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () =>
          mockListDocument("database-schemas", [
            {
              id: 1,
              attributes: {
                name: "myapp",
                status: "installed",
                created_at: "2024-01-01T00:00:00.000000Z",
                updated_at: "2024-01-01T00:00:00.000000Z",
              },
            },
          ]),
      } as never,
      organizationSlug: "test-org",
    });
    const result = await listDatabases({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("database-schemas", []) } as never,
      organizationSlug: "test-org",
    });
    const result = await listDatabases({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(0);
  });
});
