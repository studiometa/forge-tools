import { describe, expect, it } from "vitest";

import type { DaemonResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createDaemon } from "./create.ts";

describe("createDaemon", () => {
  it("should create a daemon and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            daemon: { id: 5, command: "node server.js" },
          }) as DaemonResponse,
      } as never,
    });

    const result = await createDaemon(
      { server_id: "1", command: "node server.js", user: "forge" },
      ctx,
    );

    expect(result.data.command).toBe("node server.js");
  });
});
