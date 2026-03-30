import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteDaemon } from "./delete.ts";

describe("deleteDaemon", () => {
  it("should delete a daemon", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteDaemon({ server_id: "1", id: "5" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/background-processes/5");
    expect(result.data).toBeUndefined();
  });
});
