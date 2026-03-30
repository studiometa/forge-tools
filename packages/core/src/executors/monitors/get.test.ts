import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { getMonitor } from "./get.ts";

describe("getMonitor", () => {
  it("should get a monitor and format output", async () => {
    const getMock = async () =>
      mockDocument(4, "monitors", {
        type: "disk",
        operator: "gte",
        threshold: 80,
        minutes: 5,
        state: "OK",
        state_changed_at: "2024-01-01T00:00:00.000000Z",
      });

    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getMonitor({ server_id: "1", id: "4" }, ctx);

    expect(result.data.type).toBe("disk");
  });
});
