import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteSecurityRule } from "./delete.ts";

describe("deleteSecurityRule", () => {
  it("should delete a security rule", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteSecurityRule({ server_id: "1", site_id: "2", id: "11" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/1/sites/2/security-rules/11");
    expect(result.data).toBeUndefined();
  });
});
