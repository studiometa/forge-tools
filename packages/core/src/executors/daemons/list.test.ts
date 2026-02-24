import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { listDaemons } from "./list.ts";

describe("listDaemons", () => {
  it("should list daemons on a server", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({
          daemons: [{ id: 1, command: "php artisan queue:work", user: "forge", status: "active" }],
        }),
      } as never,
    });
    const result = await listDaemons({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => ({ daemons: [] }) } as never,
    });
    const result = await listDaemons({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(0);
  });
});
