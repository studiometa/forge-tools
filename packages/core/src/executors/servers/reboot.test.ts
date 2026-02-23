import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { rebootServer } from "./reboot.ts";

describe("rebootServer", () => {
  it("should reboot a server", async () => {
    const postMock = vi.fn(async () => undefined);
    const ctx = createTestExecutorContext({ client: { post: postMock } as never });

    const result = await rebootServer({ server_id: "123" }, ctx);

    expect(postMock).toHaveBeenCalledWith("/servers/123/reboot");
    expect(result.text).toContain("reboot");
    expect(result.text).toContain("123");
  });
});
