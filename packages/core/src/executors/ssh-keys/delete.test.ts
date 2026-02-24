import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteSshKey } from "./delete.ts";

describe("deleteSshKey", () => {
  it("should delete an SSH key", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteSshKey({ server_id: "1", id: "12" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/1/keys/12");
    expect(result.data).toBeUndefined();
  });
});
