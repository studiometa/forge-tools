import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { rebootServer } from "./reboot.ts";

describe("rebootServer", () => {
  it("should reboot a server", async () => {
    const postMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { post: postMock } as never,
      organizationSlug: "test-org",
    });

    await rebootServer({ server_id: "123" }, ctx);

    expect(postMock).toHaveBeenCalledWith("/orgs/test-org/servers/123/actions", {
      action: "reboot",
    });
  });
});
