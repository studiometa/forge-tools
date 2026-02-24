import { describe, expect, it } from "vitest";

import type { MonitorResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { getMonitor } from "./get.ts";

describe("getMonitor", () => {
  it("should get a monitor and format output", async () => {
    const monitor = {
      id: 4,
      type: "disk",
      operator: "gte",
      threshold: "80",
      state: "OK",
      minutes: "5",
    };

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ monitor }) as MonitorResponse,
      } as never,
    });

    const result = await getMonitor({ server_id: "1", id: "4" }, ctx);

    expect(result.data.type).toBe("disk");
    expect(result.text).toContain("disk");
    expect(result.text).toContain("OK");
    expect(result.text).toContain("5");
  });
});
