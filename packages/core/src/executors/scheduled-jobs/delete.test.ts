import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteScheduledJob } from "./delete.ts";

describe("deleteScheduledJob", () => {
  it("should delete a scheduled job", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteScheduledJob({ server_id: "1", id: "5" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/1/jobs/5");
    expect(result.data).toBeUndefined();
  });
});
