import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteServer } from "./delete.ts";

describe("deleteServer", () => {
  it("should delete a server", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteServer({ server_id: "123" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/123");
    expect(result.text).toContain("deleted");
  });
});
