import { describe, expect, it } from "vitest";

import type { DaemonResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getDaemon } from "./get.ts";

describe("getDaemon", () => {
  it("should get a daemon and format output", async () => {
    const daemon = {
      id: 5,
      command: "node server.js",
      user: "forge",
      processes: 1,
      status: "active",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ daemon }) as DaemonResponse,
      } as never,
    });

    const result = await getDaemon({ server_id: "1", id: "5" }, ctx);

    expect(result.data.command).toBe("node server.js");
  });
});
