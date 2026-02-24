import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteDaemon } from "./delete.ts";

describe("deleteDaemon", () => {
  it("should delete a daemon", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteDaemon({ server_id: "1", id: "5" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/1/daemons/5");
    expect(result.data).toBeUndefined();
  });
});
