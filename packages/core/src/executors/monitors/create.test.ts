import { describe, expect, it } from "vitest";

import { mockDocument } from "../../test-helpers.ts";
import { createTestExecutorContext } from "../../context.ts";
import { createMonitor } from "./create.ts";

describe("createMonitor", () => {
  it("should create a monitor and format output", async () => {
    const ctx = createTestExecutorContext({
      client: {
        post: async () =>
          mockDocument(4, "monitors", {
            type: "disk",
            operator: "gte",
            threshold: 80,
            minutes: 5,
            state: "OK",
            state_changed_at: "2024-01-01T00:00:00.000000Z",
          }),
      } as never,
      organizationSlug: "test-org",
    });

    const result = await createMonitor(
      { server_id: "1", type: "disk", operator: "gte", threshold: 80, minutes: 5 },
      ctx,
    );

    expect(result.data.type).toBe("disk");
  });
});
