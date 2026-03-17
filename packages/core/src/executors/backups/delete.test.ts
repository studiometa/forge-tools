import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteBackupConfig } from "./delete.ts";

describe("deleteBackupConfig", () => {
  it("should delete a backup config", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteBackupConfig({ server_id: "1", id: "3" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/database/backups/3");
    expect(result.data).toBeUndefined();
  });
});
