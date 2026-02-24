import { describe, expect, it } from "vitest";

import type { MonitorsResponse } from "@studiometa/forge-api";

import { createTestExecutorContext } from "../../context.ts";
import { listMonitors } from "./list.ts";

describe("listMonitors", () => {
  it("should list monitors and format output", async () => {
    const monitors = [{ id: 1, type: "disk", operator: "gte", threshold: 80, state: "OK" }];

    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ monitors }) as MonitorsResponse,
      } as never,
    });

    const result = await listMonitors({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(1);
  });

  it("should handle empty list", async () => {
    const ctx = createTestExecutorContext({
      client: {
        get: async () => ({ monitors: [] }) as MonitorsResponse,
      } as never,
    });

    const result = await listMonitors({ server_id: "123" }, ctx);

    expect(result.data).toHaveLength(0);
  });
});
