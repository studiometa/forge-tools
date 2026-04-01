import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteMonitor } from "./delete.ts";

describe("deleteMonitor", () => {
  it("should delete a monitor", async () => {
    const deleteMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteMonitor({ server_id: "1", id: "4" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/monitors/4");
    expect(result.data).toBeUndefined();
  });
});
