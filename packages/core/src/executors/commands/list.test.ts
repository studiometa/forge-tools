import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listCommands } from "./list.ts";

describe("listCommands", () => {
  it("should list commands and format output", async () => {
    const getMock = async () =>
      mockListDocument("commands", [
        {
          id: 1,
          attributes: {
            command: "php artisan migrate",
            status: "finished",
            user_name: "forge",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          },
        },
      ]);

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await listCommands({ server_id: "1", site_id: "2" }, ctx);

    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("commands", []) } as never,
      organizationSlug: "test-org",
    });

    const result = await listCommands({ server_id: "1", site_id: "2" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
