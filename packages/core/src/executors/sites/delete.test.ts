import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteSite } from "./delete.ts";

describe("deleteSite", () => {
  it("should delete a site", async () => {
    const deleteMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { delete: deleteMock } as never,
      organizationSlug: "test-org",
    });

    await deleteSite({ server_id: "123", site_id: "456" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/orgs/test-org/servers/123/sites/456");
  });
});
