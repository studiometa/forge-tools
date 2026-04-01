import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteServer } from "./delete.ts";

describe("deleteServer", () => {
  it("should delete a server", async () => {
    const deleteMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    await deleteServer({ server_id: "123" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/123");
  });
});
