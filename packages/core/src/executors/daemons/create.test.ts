import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createDaemon } from "./create.ts";

describe("createDaemon", () => {
  it("should create a daemon and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(5, "background-processes", {
            command: "node server.js",
            user: "forge",
            directory: null,
            processes: 1,
            startsecs: 1,
            stopsignal: "TERM",
            stopwaitsecs: 10,
            status: "creating",
            created_at: "2024-01-01T00:00:00.000000Z",
            updated_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createDaemon(
      { server_id: "1", command: "node server.js", user: "forge" },
      ctx,
    );

    expect(result.data.command).toBe("node server.js");
  });
});
