import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteScheduledJob } from "./delete.ts";

describe("deleteScheduledJob", () => {
  it("should delete a scheduled job", async () => {
    const deleteMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteScheduledJob({ server_id: "1", id: "5" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/scheduled-jobs/5");
    expect(result.data).toBeUndefined();
  });
});
