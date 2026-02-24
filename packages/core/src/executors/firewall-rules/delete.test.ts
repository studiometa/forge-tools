import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { deleteFirewallRule } from "./delete.ts";

describe("deleteFirewallRule", () => {
  it("should delete a firewall rule", async () => {
    const deleteMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { delete: deleteMock } as never });

    const result = await deleteFirewallRule({ server_id: "1", id: "3" }, ctx);

    expect(deleteMock).toHaveBeenCalledWith("/servers/1/firewall-rules/3");
    expect(result.data).toBeUndefined();
  });
});
