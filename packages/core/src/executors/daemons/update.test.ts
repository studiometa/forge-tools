import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { updateDaemon } from "./update.ts";

describe("updateDaemon", () => {
  it("should update a daemon and return result", async () => {
    const ctx = createTestExecutorContext({
      client: {
        put: async () =>
          mockDocument(5, "background-processes", {
            command: "node server.js",
            user: "forge",
            directory: null,
            processes: 1,
            status: "running",
            created_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await updateDaemon(
      { server_id: "1", id: "5", name: "my-daemon", config: "some-config" },
      ctx,
    );

    expect(result.data.id).toBe(5);
    expect(result.data.command).toBe("node server.js");
  });
});
