import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createDatabase } from "./create.ts";

describe("createDatabase", () => {
  it("should create a database and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(7, "database-schemas", {
            name: "myapp",
            status: "creating",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createDatabase({ server_id: "1", name: "myapp" }, ctx);

    expect(result.data.name).toBe("myapp");
  });
});
