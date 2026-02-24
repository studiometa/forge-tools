import { describe, expect, it } from "vitest";

import type { MonitorResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { createMonitor } from "./create.ts";

describe("createMonitor", () => {
  it("should create a monitor and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          ({
            monitor: { id: 4, type: "disk", operator: "gte", threshold: "80" },
          }) as MonitorResponse,
      } as never,
    });

    const result = await createMonitor(
      { server_id: "1", type: "disk", operator: "gte", threshold: "80", minutes: "5" },
      ctx,
    );

    expect(result.data.type).toBe("disk");
  });
});
