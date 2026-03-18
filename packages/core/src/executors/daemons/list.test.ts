import { describe, expect, it } from "vitest";

import { mockListDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { listDaemons } from "./list.ts";

describe("listDaemons", () => {
  it("should list daemons on a server", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () =>
          mockListDocument("background-processes", [
            {
              id: 1,
              attributes: {
                command: "php artisan queue:work",
                user: "forge",
                directory: null,
                processes: 1,
                startsecs: 1,
                stopsignal: "TERM",
                stopwaitsecs: 10,
                status: "active",
                created_at: "2024-01-01T00:00:00.000000Z",
                updated_at: "2024-01-01T00:00:00.000000Z",
              },
            },
          ]),
      } as never,
      organizationSlug: "test-org",
    });
    const result = await listDaemons({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => mockListDocument("background-processes", []) } as never,
      organizationSlug: "test-org",
    });
    const result = await listDaemons({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(0);
  });
});
