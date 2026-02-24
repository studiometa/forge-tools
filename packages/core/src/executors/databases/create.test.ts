import { describe, expect, it } from "vitest";

import type { DatabaseResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createDatabase } from "./create.ts";

describe("createDatabase", () => {
  it("should create a database and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            database: { id: 7, name: "myapp" },
          }) as DatabaseResponse,
      } as never,
    });

    const result = await createDatabase({ server_id: "1", name: "myapp" }, ctx);

    expect(result.data.name).toBe("myapp");
  });
});
