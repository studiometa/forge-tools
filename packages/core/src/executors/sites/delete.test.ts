import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteSite } from "./delete.ts";

describe("deleteSite", () => {
  it("should delete a site", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteSite({ server_id: 123, site_id: 456 }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/123/sites/456");
    expect(result.text).toContain("deleted");
  });
});
