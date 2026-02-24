import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteMonitor } from "./delete.ts";

describe("deleteMonitor", () => {
  it("should delete a monitor", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteMonitor({ server_id: "1", id: "4" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/1/monitors/4");
    expect(result.data).toBeUndefined();
    expect(result.text).toContain("deleted");
  });
});
