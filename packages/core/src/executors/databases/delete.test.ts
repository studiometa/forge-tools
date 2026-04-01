import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteDatabase } from "./delete.ts";

describe("deleteDatabase", () => {
  it("should delete a database", async () => {
    const deleteMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    const result = await deleteDatabase({ server_id: "1", id: "7" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/database/schemas/7");
    expect(result.data).toBeUndefined();
  });
});
