import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getDaemon } from "./get.ts";

describe("getDaemon", () => {
  it("should get a daemon and format output", async () => {
    const getMock = async () =>
      mockDocument(5, "background-processes", {
        command: "node server.js",
        user: "forge",
        directory: null,
        processes: 1,
        status: "active",
        created_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getDaemon({ server_id: "1", id: "5" }, ctx);

    expect(result.data.command).toBe("node server.js");
  });
});
