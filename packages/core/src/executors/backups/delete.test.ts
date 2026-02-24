import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteBackupConfig } from "./delete.ts";

describe("deleteBackupConfig", () => {
  it("should delete a backup config", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteBackupConfig({ server_id: "1", id: "3" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/1/backup-configs/3");
    expect(result.data).toBeUndefined();
    expect(result.text).toContain("deleted");
  });
});
