import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getDatabase } from "./get.ts";

describe("getDatabase", () => {
  it("should get a database and format output", async () => {
    const getMock = async () =>
      mockDocument(7, "database-schemas", {
        name: "myapp",
        status: "installed",
        created_at: "2024-01-01T00:00:00.000000Z",
        updated_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getDatabase({ server_id: "1", id: "7" }, ctx);

    expect(result.data.name).toBe("myapp");
  });
});
