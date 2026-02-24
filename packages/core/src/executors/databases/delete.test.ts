import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteDatabase } from "./delete.ts";

describe("deleteDatabase", () => {
  it("should delete a database", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteDatabase({ server_id: "1", id: "7" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/1/databases/7");
    expect(result.data).toBeUndefined();
  });
});
