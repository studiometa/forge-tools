import { describe, expect, it } from "vitest";

import type { DatabaseResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getDatabase } from "./get.ts";

describe("getDatabase", () => {
  it("should get a database and format output", async () => {
    const db = {
      id: 7,
      name: "myapp",
      status: "installed",
      created_at: "2024-01-01T00:00:00.000000Z",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ database: db }) as DatabaseResponse,
      } as never,
    });

    const result = await getDatabase({ server_id: "1", id: "7" }, ctx);

    expect(result.data.name).toBe("myapp");
  });
});
