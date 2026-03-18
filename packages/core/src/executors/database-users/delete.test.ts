import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteDatabaseUser } from "./delete.ts";

describe("deleteDatabaseUser", () => {
  it("should delete a database user", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteDatabaseUser({ server_id: "1", id: "7" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/database/users/7");
    expect(result.data).toBeUndefined();
  });
});
