import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { listDatabaseUsers } from "./list.ts";

describe("listDatabaseUsers", () => {
  it("should list database users on a server", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({
          users: [{ id: 1, name: "forge", status: "installed", server_id: 1, databases: [] }],
        }),
      } as never,
    });
    const result = await listDatabaseUsers({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => ({ users: [] }) } as never,
    });
    const result = await listDatabaseUsers({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(0);
  });
});
