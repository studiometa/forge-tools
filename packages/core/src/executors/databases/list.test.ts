import { describe, expect, it } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { listDatabases } from "./list.ts";

describe("listDatabases", () => {
  it("should list databases on a server", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({
          databases: [{ id: 1, name: "myapp", status: "installed" }],
        }),
      } as never,
    });
    const result = await listDatabases({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: { get: async () => ({ databases: [] }) } as never,
    });
    const result = await listDatabases({ server_id: "1" }, ctx);
    expect(result.data).toHaveLength(0);
  });
});
